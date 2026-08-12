"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

import { cn } from "@/app/lib/utils";

// MSCI Emerging Markets Index constituents (24 markets, 2026).
// numeric = ISO 3166-1 numeric (matches world-atlas topojson ids); iso2 = World Bank API code.
type EmCountry = { name: string; numeric: string; iso2: string };

const EM_COUNTRIES: EmCountry[] = [
  { name: "Brazil", numeric: "076", iso2: "BR" },
  { name: "Chile", numeric: "152", iso2: "CL" },
  { name: "China", numeric: "156", iso2: "CN" },
  { name: "Colombia", numeric: "170", iso2: "CO" },
  { name: "Czechia", numeric: "203", iso2: "CZ" },
  { name: "Egypt", numeric: "818", iso2: "EG" },
  { name: "Greece", numeric: "300", iso2: "GR" },
  { name: "Hungary", numeric: "348", iso2: "HU" },
  { name: "India", numeric: "356", iso2: "IN" },
  { name: "Indonesia", numeric: "360", iso2: "ID" },
  { name: "South Korea", numeric: "410", iso2: "KR" },
  { name: "Kuwait", numeric: "414", iso2: "KW" },
  { name: "Malaysia", numeric: "458", iso2: "MY" },
  { name: "Mexico", numeric: "484", iso2: "MX" },
  { name: "Peru", numeric: "604", iso2: "PE" },
  { name: "Philippines", numeric: "608", iso2: "PH" },
  { name: "Poland", numeric: "616", iso2: "PL" },
  { name: "Qatar", numeric: "634", iso2: "QA" },
  { name: "Saudi Arabia", numeric: "682", iso2: "SA" },
  { name: "South Africa", numeric: "710", iso2: "ZA" },
  { name: "Taiwan", numeric: "158", iso2: "TW" },
  { name: "Thailand", numeric: "764", iso2: "TH" },
  { name: "Turkey", numeric: "792", iso2: "TR" },
  { name: "UAE", numeric: "784", iso2: "AE" },
];
const EM_BY_NUMERIC: Record<string, EmCountry> = Object.fromEntries(
  EM_COUNTRIES.map((c) => [c.numeric, c]),
);

// World Bank indicators shown in the chart / tooltips.
type IndicatorMeta = { label: string; fmt: (v: number) => string };
const INDICATORS: Record<string, IndicatorMeta> = {
  "NY.GDP.MKTP.CD": { label: "GDP", fmt: (v) => "$" + d3.format(".3s")(v).replace("G", "B") },
  "NE.TRD.GNFS.ZS": { label: "Trade % of GDP", fmt: (v) => d3.format(".1f")(v) + "%" },
  "NY.GDP.MKTP.KD.ZG": { label: "GDP growth", fmt: (v) => d3.format("+.1f")(v) + "%" },
  "SP.POP.TOTL": { label: "Population", fmt: (v) => d3.format(".3s")(v).replace("G", "B") },
};
const INDICATOR_ENTRIES = Object.entries(INDICATORS);
const DEFAULT_INDICATOR = "NE.TRD.GNFS.ZS";

const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

type WbEntry = { value: number; year: string };
type WbSeries = Record<string, WbEntry>; // iso2 -> latest value
type WbApiRow = { country: { id: string }; value: number | null; date: string };

// indicator code -> { iso2: {value, year} }. Module-scoped so it survives remounts.
const wbData: Record<string, WbSeries> = {};
// in-flight requests, so the map pre-fetch and the chart don't double-hit the API.
const wbInflight: Record<string, Promise<WbSeries>> = {};

async function requestIndicator(ind: string): Promise<WbSeries> {
  const codes = EM_COUNTRIES.map((c) => c.iso2).join(";");
  // A recent date range + client-side "latest non-null" is more reliable than the
  // API's mrnev flag, which returns HTTP 400 for some indicators (e.g. GDP).
  const url = `https://api.worldbank.org/v2/country/${codes}/indicator/${ind}?format=json&date=2010:2025&per_page=1000`;
  let rows: WbApiRow[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tm);
      if (!res.ok) throw new Error(`World Bank API ${res.status}`);
      const json = (await res.json()) as [unknown, WbApiRow[] | null];
      rows = json?.[1] ?? [];
      break;
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
  const out: WbSeries = {};
  rows.forEach((row) => {
    if (row.value == null) return;
    const prev = out[row.country.id];
    if (!prev || row.date > prev.year) out[row.country.id] = { value: row.value, year: row.date };
  });
  return out;
}

async function fetchIndicator(ind: string): Promise<WbSeries> {
  if (wbData[ind]) return wbData[ind];
  if (!wbInflight[ind]) {
    wbInflight[ind] = requestIndicator(ind)
      .then((series) => {
        wbData[ind] = series; // cache only successful responses
        return series;
      })
      .finally(() => {
        delete wbInflight[ind]; // a failed request can be retried
      });
  }
  return wbInflight[ind];
}

// world-atlas ids are zero-padded numeric strings; normalise so numbers/short strings still match.
const idKey = (d: d3.ExtendedFeature): string => String(d.id ?? "").padStart(3, "0");

type ChartRow = EmCountry & WbEntry;

export default function EmergingMarketsSection({ className }: { className?: string }) {
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapMountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartMountRef = useRef<HTMLDivElement>(null);

  const [activeInd, setActiveInd] = useState(DEFAULT_INDICATOR);
  const [statusText, setStatusText] = useState("Loading World Bank data…");
  const [chartError, setChartError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // ── World map (draws once) ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const mount = mapMountRef.current;
    const wrap = mapWrapRef.current;
    const tooltip = tooltipRef.current;
    if (!mount || !wrap || !tooltip) return;

    (async () => {
      const width = 1140;
      const height = 560;
      let topo: Topology;
      try {
        topo = (await (await fetch(WORLD_ATLAS_URL)).json()) as Topology;
      } catch {
        return; // no map is better than a crash; the copy still stands on its own
      }
      if (cancelled) return;

      const world = feature(
        topo,
        topo.objects.countries as GeometryCollection,
      ) as unknown as d3.ExtendedFeatureCollection;
      // Drop Antarctica (ISO numeric 010) so the map fills the frame without the polar band.
      const landFeatures = world.features.filter((d) => idKey(d) !== "010");
      const land = {
        type: "FeatureCollection",
        features: landFeatures,
      } as unknown as d3.ExtendedFeatureCollection;
      const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
      const path = d3.geoPath(projection);

      const svg = d3
        .select(mount)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style("width", "100%")
        .style("height", "auto");

      // Live hover stats load in the background — the map never waits for them.
      let gdp: WbSeries = {};
      let trade: WbSeries = {};
      let growth: WbSeries = {};
      let pop: WbSeries = {};
      Promise.all([
        fetchIndicator("NY.GDP.MKTP.CD"),
        fetchIndicator("NE.TRD.GNFS.ZS"),
        fetchIndicator("NY.GDP.MKTP.KD.ZG"),
        fetchIndicator("SP.POP.TOTL"),
      ])
        .then(([g, t, gr, p]) => {
          gdp = g;
          trade = t;
          growth = gr;
          pop = p;
        })
        .catch(() => {
          /* tooltips fall back to country names only */
        });

      svg
        .append("g")
        .selectAll<SVGPathElement, d3.ExtendedFeature>("path")
        .data(landFeatures)
        .join("path")
        .attr("d", (d) => path(d))
        .attr("fill", (d) => (EM_BY_NUMERIC[idKey(d)] ? "#6cbe45" : "#2a5c3b"))
        .attr("stroke", "#123c21")
        .attr("stroke-width", 0.6)
        .style("cursor", (d) => (EM_BY_NUMERIC[idKey(d)] ? "pointer" : "default"))
        .on("mousemove", (event: MouseEvent, d) => {
          const em = EM_BY_NUMERIC[idKey(d)];
          if (!em) {
            tooltip.style.opacity = "0";
            return;
          }
          const g = gdp[em.iso2];
          const t = trade[em.iso2];
          const gr = growth[em.iso2];
          const p = pop[em.iso2];
          const statsPending = !g && !t && !gr && !p;
          const rowStyle = "display:flex;justify-content:space-between;gap:14px;";
          const row = (label: string, value: string) =>
            `<div style="${rowStyle}"><span>${label}</span><span style="font-weight:700;">${value}</span></div>`;
          tooltip.innerHTML =
            `<span style="font-family:'Candu',sans-serif;text-transform:uppercase;font-size:18px;color:#18512d;display:block;margin-bottom:4px;">${em.name}</span>` +
            (statsPending ? `<div style="${rowStyle}"><span>Loading stats…</span></div>` : "") +
            (g ? row(`GDP (${g.year})`, INDICATORS["NY.GDP.MKTP.CD"].fmt(g.value)) : "") +
            (t ? row(`Trade (${t.year})`, INDICATORS["NE.TRD.GNFS.ZS"].fmt(t.value) + " of GDP") : "") +
            (gr ? row(`GDP growth (${gr.year})`, INDICATORS["NY.GDP.MKTP.KD.ZG"].fmt(gr.value)) : "") +
            (p ? row(`Population (${p.year})`, INDICATORS["SP.POP.TOTL"].fmt(p.value)) : "");
          const r = wrap.getBoundingClientRect();
          let x = event.clientX - r.left + 16;
          const y = event.clientY - r.top - 10;
          if (x + 220 > r.width) x -= 250;
          tooltip.style.left = x + "px";
          tooltip.style.top = y + "px";
          tooltip.style.opacity = "1";
          d3.select(event.currentTarget as SVGPathElement).attr("fill", "#8fd86b");
        })
        .on("mouseleave", (event: MouseEvent, d) => {
          tooltip.style.opacity = "0";
          d3.select(event.currentTarget as SVGPathElement).attr(
            "fill",
            EM_BY_NUMERIC[idKey(d)] ? "#6cbe45" : "#2a5c3b",
          );
        });
    })();

    return () => {
      cancelled = true;
      d3.select(mount).selectAll("svg").remove();
    };
  }, []);

  // ── Ranked bar chart (redraws on metric / retry) ────────
  useEffect(() => {
    let cancelled = false;
    const mount = chartMountRef.current;
    if (!mount) return;

    (async () => {
      setChartError(false);
      setStatusText("Loading World Bank data…");
      d3.select(mount).select("svg").remove();

      let data: WbSeries;
      try {
        data = await fetchIndicator(activeInd);
      } catch {
        if (!cancelled) setChartError(true);
        return;
      }
      if (cancelled) return;

      const rows: ChartRow[] = EM_COUNTRIES.map((c) => {
        const entry = data[c.iso2];
        return entry ? { ...c, value: entry.value, year: entry.year } : null;
      })
        .filter((r): r is ChartRow => r !== null)
        .sort((a, b) => b.value - a.value);

      if (!rows.length) {
        setStatusText("No data returned for this metric.");
        return;
      }
      const year = rows[0].year;

      const margin = { top: 6, right: 70, bottom: 6, left: 110 };
      const barH = 26;
      const width = 1100;
      const height = rows.length * barH + margin.top + margin.bottom;
      const fmt = INDICATORS[activeInd].fmt;

      const svg = d3
        .select(mount)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style("width", "100%")
        .style("height", "auto");
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(rows, (r) => r.value) ?? 0])
        .range([0, width - margin.left - margin.right]);
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const row = g
        .selectAll<SVGGElement, ChartRow>("g.row")
        .data(rows)
        .join("g")
        .attr("class", "row")
        .attr("transform", (_d, i) => `translate(0,${i * barH})`);
      row
        .append("rect")
        .attr("height", barH - 7)
        .attr("rx", 5)
        .attr("fill", "#6cbe45")
        .attr("width", 0)
        .transition()
        .duration(600)
        .delay((_d, i) => i * 18)
        .attr("width", (d) => Math.max(3, x(d.value)));
      row
        .append("text")
        .attr("x", -10)
        .attr("y", (barH - 7) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", "#f1f1f1")
        .attr("font-size", 13)
        .attr("font-weight", 700)
        .text((d) => d.name);
      row
        .append("text")
        .attr("x", (d) => x(d.value) + 8)
        .attr("y", (barH - 7) / 2)
        .attr("dy", "0.35em")
        .attr("fill", "rgba(241,241,241,0.85)")
        .attr("font-size", 12)
        .text((d) => fmt(d.value));

      setStatusText(
        `${INDICATORS[activeInd].label} · latest available year (mostly ${year}) · Source: World Bank Open Data`,
      );
    })();

    return () => {
      cancelled = true;
      d3.select(mount).selectAll("svg").remove();
    };
  }, [activeInd, reloadKey]);

  return (
    <section
      className={cn(
        "flex w-full max-w-[1190px] flex-col items-center gap-6 rounded-section bg-emn-green-dark px-6 py-12 text-emn-offwhite md:gap-8 md:px-[50px] md:py-[60px]",
        className,
      )}
    >
      <h2 className="text-center font-candu text-[40px] uppercase leading-none md:text-[76px]">
        WHAT ARE EMERGING MARKETS?
      </h2>

      <div className="flex max-w-[896px] flex-col gap-4 text-center">
        <p className="text-lg leading-relaxed text-emn-offwhite/90 md:text-description">
          Emerging markets are economies undergoing rapid structural change as incomes rise,
          industries scale, capital markets deepen and global integration accelerates.
        </p>
        <p className="text-lg leading-relaxed text-emn-offwhite/90 md:text-description">
          They are increasingly central to global growth, supply chains, strategic resources and
          consumer demand. Understanding emerging markets means understanding where capital,
          opportunity and geopolitical power are moving. Start engaging with them now!
        </p>
      </div>

      {/* The map shows everywhere; the chart is hover-driven and too cramped on phones — desktop/tablet only. */}
      <div className="mt-4 grid w-full grid-cols-1 gap-10">
        {/* Map */}
        <div>
          <h3 className="font-candu text-2xl uppercase md:text-[28px]">The emerging markets map</h3>
          <p className="mb-4 mt-1.5 text-[13px] text-emn-offwhite/65">
            <a
              href="https://www.msci.com/indexes/group/emerging-markets-indexes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emn-green underline-offset-2 hover:underline"
            >
              MSCI EM Index
            </a>{" "}
            countries in light green — hover a country for its live stats (World Bank, latest year
            available).
          </p>
          <div ref={mapWrapRef} className="relative rounded-2xl bg-[#123c21] p-2.5">
            <div ref={mapMountRef} />
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-[5] min-w-[190px] rounded-xl bg-emn-offwhite px-4 py-3 text-[13px] leading-snug text-emn-black opacity-0 shadow-[0_6px_24px_rgba(0,0,0,0.35)] transition-opacity"
            />
          </div>
        </div>

        {/* Chart */}
        <div className="hidden md:block">
          <h3 className="font-candu text-2xl uppercase md:text-[28px]">Compare the EM economies</h3>
          <p className="mb-4 mt-1.5 text-[13px] text-emn-offwhite/65">
            Live from the{" "}
            <a
              href="https://data.worldbank.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emn-green underline-offset-2 hover:underline"
            >
              World Bank Open Data API
            </a>{" "}
            — switch metric to re-rank all 24 countries.
          </p>
          <div className="rounded-2xl bg-[#123c21] px-5 pb-3.5 pt-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {INDICATOR_ENTRIES.map(([ind, meta]) => {
                const active = ind === activeInd;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setActiveInd(ind)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-[13px] font-bold transition-colors",
                      active
                        ? "border-emn-green bg-emn-green text-white"
                        : "border-emn-offwhite/40 text-emn-offwhite hover:border-emn-green hover:bg-emn-green hover:text-white",
                    )}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="px-0.5 py-2.5 text-[13px] text-emn-offwhite/60">
              {chartError ? (
                <span>
                  Couldn&apos;t reach the World Bank API —{" "}
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="text-emn-green underline"
                  >
                    retry
                  </button>
                  .
                </span>
              ) : (
                statusText
              )}
            </div>
            <div ref={chartMountRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
