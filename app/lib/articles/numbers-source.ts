// Server-side source for "The Numbers" markets snapshot.
//
// The figures come from four Google-Drive-hosted .xlsx workbooks (one per
// region: India, China, Africa, Global & Commodities). A committee member edits
// the same data tab in each file every week; this module downloads each file,
// reads the current numbers, and shapes them into the NumbersRegion structure
// the UI already uses. Anything going wrong — a missing env var, a network
// error, a file whose layout we can't read — falls back to the baked-in data in
// numbers.ts, so the page never renders empty.
//
// LAYOUT (learned from the real files): each data tab has two side-by-side
// tables. A left "Output" block (Indicator | 1 Week | YTD) is the pretty version
// — but it's inconsistent across files (some show =ABS() with direction only in
// red/green font, some show signed values, bonds are text like "0.4 bps"). A
// right "Input" block is uniform: Indicator | 1 Week | YTD | Unit, where 1 Week
// and YTD are the real SIGNED numbers and Unit is "%" or "bps". So we read
// values + units from the Input block, and take the display labels from the
// Output block (zipped by position, since the two blocks can be offset by a
// row). "%" values are ratios (×100 for display); "bps" values are shown as-is.
// The "Template" tab and the lower "Example"/"Explanation" rows are skipped.

import ExcelJS from "exceljs";
import {
  MARKET_NUMBERS,
  NUMBERS_AS_AT,
  NUMBERS_DEFAULT_REGION,
  type NumbersIndicator,
  type NumbersRegion,
} from "@/app/lib/articles/numbers";

export interface MarketNumbers {
  regions: NumbersRegion[];
  /** "As at" stamp shown next to the heading. */
  asAt: string;
  /** Region id the filter should select on first render. */
  defaultRegionId: string;
}

/** One workbook per region. `env` names the var holding its Drive URL / id. */
const SOURCES: { id: string; label: string; env: string }[] = [
  { id: "india", label: "India", env: "NUMBERS_XLSX_INDIA" },
  { id: "china", label: "China", env: "NUMBERS_XLSX_CHINA" },
  { id: "africa", label: "Africa", env: "NUMBERS_XLSX_AFRICA" },
  { id: "global", label: "Global & Commodities", env: "NUMBERS_XLSX_GLOBAL" },
];

/** Cache each download in Next's Data Cache before revalidating (seconds). */
const REVALIDATE_SECONDS = 3600;
/** Rows to scan for the header, and rows to read below it, before giving up. */
const SCAN_ROWS = 40;
const MAX_DATA_ROWS = 60;

const FALLBACK: MarketNumbers = {
  regions: MARKET_NUMBERS,
  asAt: NUMBERS_AS_AT,
  defaultRegionId: NUMBERS_DEFAULT_REGION,
};

/**
 * Resolve the markets snapshot from the four configured workbooks; returns the
 * baked-in fallback if none are configured or all fail.
 */
export async function getMarketNumbers(): Promise<MarketNumbers> {
  const regions: NumbersRegion[] = [];
  let latestAsAt: Date | null = null;

  const configured = SOURCES.filter((s) => process.env[s.env]);
  if (configured.length === 0) {
    console.warn(
      "[numbers] no NUMBERS_XLSX_* env vars set — using fallback (numbers.ts)"
    );
    return FALLBACK;
  }

  for (const source of SOURCES) {
    const raw = process.env[source.env];
    if (!raw) continue; // region simply not wired up yet
    const fileId = extractFileId(raw);
    if (!fileId) {
      console.error(`[numbers] ${source.id}: couldn't read a file id from ${source.env}`);
      continue;
    }

    try {
      const buffer = await downloadXlsx(fileId);
      const { indicators, asAt } = parseWorkbook(await loadWorkbook(buffer));
      if (indicators.length === 0) {
        console.error(`[numbers] ${source.id}: no indicators parsed; skipping`);
        continue;
      }
      regions.push({ id: source.id, label: source.label, indicators });
      if (asAt && (!latestAsAt || asAt > latestAsAt)) latestAsAt = asAt;
    } catch (err) {
      console.error(`[numbers] ${source.id}: fetch/parse failed; skipping`, err);
    }
  }

  if (regions.length === 0) {
    console.warn("[numbers] every configured source failed — using fallback");
    return FALLBACK;
  }

  const hasGlobal = regions.some((r) => r.id === NUMBERS_DEFAULT_REGION);
  return {
    regions,
    asAt: latestAsAt ? formatAsAt(latestAsAt) : NUMBERS_AS_AT,
    defaultRegionId: hasGlobal ? NUMBERS_DEFAULT_REGION : regions[0].id,
  };
}

// ── Fetching ────────────────────────────────────────────────────────────────

async function downloadXlsx(fileId: string): Promise<Buffer> {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  // No AbortSignal here: in Next, passing `signal` opts the fetch out of the
  // Data Cache, which would defeat the hourly caching.
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`download ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  // ExcelJS's bundled types want Buffer<ArrayBuffer>; @types/node yields the
  // generic Buffer<ArrayBufferLike>. Same object at runtime — cast to the param.
  await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
  return wb;
}

/** Accepts a full Drive share URL or a bare file id; returns the id or null. */
function extractFileId(input: string): string | null {
  const trimmed = input.trim();
  const inPath = trimmed.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (inPath) return inPath[1];
  const inQuery = trimmed.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (inQuery) return inQuery[1];
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed;
  return null;
}

// ── Workbook parsing ─────────────────────────────────────────────────────────

function parseWorkbook(wb: ExcelJS.Workbook): {
  indicators: NumbersIndicator[];
  asAt: Date | null;
} {
  const ws =
    wb.worksheets.find((w) => w.name.trim().toLowerCase() !== "template") ??
    wb.worksheets[0];
  if (!ws) return { indicators: [], asAt: null };

  const cols = locateColumns(ws);
  if (!cols) return { indicators: [], asAt: null };

  const inputRows = readInputRows(ws, cols);
  const { labels, asAt } = readOutputLabels(ws, cols);

  // Both blocks list the same indicators in the same order; borrow the Output
  // labels only when the counts line up, else keep the Input block's own labels.
  const useOutput = labels.length === inputRows.length;
  const indicators = inputRows.map((row, i) => {
    const isBps = /bps/i.test(row.unit);
    return {
      label: useOutput ? labels[i] : row.label,
      week: isBps ? row.week : row.week * 100,
      ytd: isBps ? row.ytd : row.ytd * 100,
      unit: isBps ? "bps" : "%",
    } satisfies NumbersIndicator;
  });

  return { indicators, asAt };
}

interface Columns {
  inHeaderRow: number;
  inLabelCol: number;
  inWeekCol: number;
  inYtdCol: number;
  inUnitCol: number;
  outHeaderRow: number;
  outLabelCol: number; // -1 when there's no separate Output block
}

/**
 * Find the columns we read. The Input block is identified by its "Unit" header;
 * on that header row the Input Indicator/1 Week/YTD are the columns just left of
 * Unit. The Output label column is the leftmost "Indicator" header that isn't
 * the Input one (may sit on a different row — the blocks can be offset).
 */
function locateColumns(ws: ExcelJS.Worksheet): Columns | null {
  const scanTo = Math.min(ws.rowCount, SCAN_ROWS);

  let inHeaderRow = -1;
  let inUnitCol = -1;
  for (let r = 1; r <= scanTo && inUnitCol < 0; r++) {
    ws.getRow(r).eachCell((cell, c) => {
      if (inUnitCol < 0 && cellText(cell.value).toLowerCase() === "unit") {
        inHeaderRow = r;
        inUnitCol = c;
      }
    });
  }
  if (inHeaderRow < 0) return null;

  let inLabelCol = -1;
  let inWeekCol = -1;
  let inYtdCol = -1;
  ws.getRow(inHeaderRow).eachCell((cell, c) => {
    if (c >= inUnitCol) return; // Input headers sit left of the Unit column
    const t = cellText(cell.value).toLowerCase();
    if (t === "indicator") inLabelCol = Math.max(inLabelCol, c);
    else if (t === "1 week") inWeekCol = Math.max(inWeekCol, c);
    else if (t === "ytd") inYtdCol = Math.max(inYtdCol, c);
  });
  if (inLabelCol < 0 || inWeekCol < 0 || inYtdCol < 0) return null;

  let outLabelCol = -1;
  let outHeaderRow = -1;
  for (let r = 1; r <= scanTo; r++) {
    ws.getRow(r).eachCell((cell, c) => {
      if (cellText(cell.value).toLowerCase() !== "indicator") return;
      if (r === inHeaderRow && c === inLabelCol) return; // that's the Input one
      if (outLabelCol < 0 || c < outLabelCol) {
        outLabelCol = c;
        outHeaderRow = r;
      }
    });
  }

  return {
    inHeaderRow,
    inLabelCol,
    inWeekCol,
    inYtdCol,
    inUnitCol,
    outHeaderRow,
    outLabelCol,
  };
}

function readInputRows(
  ws: ExcelJS.Worksheet,
  cols: Columns
): { label: string; week: number; ytd: number; unit: string }[] {
  const rows: { label: string; week: number; ytd: number; unit: string }[] = [];
  const lastRow = Math.min(ws.rowCount, cols.inHeaderRow + MAX_DATA_ROWS);
  for (let r = cols.inHeaderRow + 1; r <= lastRow; r++) {
    const row = ws.getRow(r);
    const label = cellText(row.getCell(cols.inLabelCol).value);
    const low = label.toLowerCase();
    if (!label || label === "-") {
      if (rows.length > 0) break;
      continue;
    }
    if (low.startsWith("as at") || low === "explanation" || low === "example")
      break;

    const week = cellNumber(row.getCell(cols.inWeekCol).value);
    const ytd = cellNumber(row.getCell(cols.inYtdCol).value);
    if (week === null || ytd === null) continue;
    const unit = cellText(row.getCell(cols.inUnitCol).value);
    rows.push({ label, week, ytd, unit });
  }
  return rows;
}

function readOutputLabels(
  ws: ExcelJS.Worksheet,
  cols: Columns
): { labels: string[]; asAt: Date | null } {
  const labels: string[] = [];
  let asAt: Date | null = null;
  if (cols.outLabelCol < 0) return { labels, asAt };

  const lastRow = Math.min(ws.rowCount, cols.outHeaderRow + MAX_DATA_ROWS);
  for (let r = cols.outHeaderRow + 1; r <= lastRow; r++) {
    const row = ws.getRow(r);
    const label = cellText(row.getCell(cols.outLabelCol).value);
    const low = label.toLowerCase();
    if (low.startsWith("as at")) {
      asAt = rowDate(row);
      break;
    }
    if (low === "example" || low === "explanation") break;
    if (!label || label === "-") {
      if (labels.length > 0) break;
      continue;
    }
    labels.push(label);
  }
  return { labels, asAt };
}

// ── Cell helpers (ExcelJS CellValue is a union; narrow carefully) ─────────────

type CV = ExcelJS.CellValue;

function cellText(v: CV): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v && Array.isArray(v.richText))
      return v.richText.map((t) => t.text).join("").trim();
    if ("text" in v && v.text != null) return String(v.text).trim(); // hyperlink
    if ("result" in v) return cellText(v.result as CV); // formula
  }
  return "";
}

function cellNumber(v: CV): number | null {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "result" in v && typeof v.result === "number")
    return v.result;
  if (typeof v === "string") {
    const n = Number(v.replace(/[%,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function cellDate(v: CV): Date | null {
  if (v instanceof Date) return v;
  if (v && typeof v === "object" && "result" in v && v.result instanceof Date)
    return v.result;
  return null;
}

/** First date found in a row, accepting Date cells or dd/mm/yyyy / ISO strings. */
function rowDate(row: ExcelJS.Row): Date | null {
  let found: Date | null = null;
  row.eachCell((cell) => {
    if (found) return;
    found = cellDate(cell.value) ?? parseDateString(cellText(cell.value));
  });
  return found;
}

function parseDateString(s: string): Date | null {
  if (!s) return null;
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const d = new Date(Date.UTC(+dmy[3], +dmy[2] - 1, +dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatAsAt(d: Date): string {
  return `As at market close · ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
