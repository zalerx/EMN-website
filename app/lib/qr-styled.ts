import QRCode from "qrcode";

/**
 * Generates a styled QR code as an SVG data URL.
 * - Data modules rendered as circles instead of squares
 * - Position pattern "eyes" use EMN leaf-shaped corners (rounded TL + BR)
 */
export function generateStyledQR(
  data: string,
  opts: {
    size?: number;
    fgColor?: string;
    bgColor?: string;
    dotScale?: number;
  } = {}
): string {
  const {
    size = 240,
    fgColor = "#ffffff",
    bgColor = "transparent",
    dotScale = 0.85,
  } = opts;

  // Generate raw QR matrix
  const qr = QRCode.create(data, { errorCorrectionLevel: "M" });
  const modules = qr.modules;
  const moduleCount = modules.size;
  const cellSize = size / moduleCount;
  const radius = (cellSize * dotScale) / 2;

  // Position pattern locations (top-left corner of each 7x7 eye)
  const eyes = [
    { row: 0, col: 0 },                          // top-left
    { row: 0, col: moduleCount - 7 },             // top-right
    { row: moduleCount - 7, col: 0 },             // bottom-left
  ];

  function isInEye(row: number, col: number): boolean {
    return eyes.some(
      (e) => row >= e.row && row < e.row + 7 && col >= e.col && col < e.col + 7
    );
  }

  function isOn(row: number, col: number): boolean {
    return modules.get(row, col) === 1;
  }

  // Build SVG
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`
  );

  if (bgColor !== "transparent") {
    parts.push(`<rect width="${size}" height="${size}" fill="${bgColor}" />`);
  }

  // 1. Draw data modules as circles (skip eye regions)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isInEye(row, col)) continue;
      if (!isOn(row, col)) continue;

      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fgColor}" />`);
    }
  }

  // 2. Draw custom eye patterns with leaf-shaped corners
  for (const eye of eyes) {
    const x = eye.col * cellSize;
    const y = eye.row * cellSize;
    const s7 = 7 * cellSize; // outer size
    const s5 = 5 * cellSize; // gap size
    const s3 = 3 * cellSize; // inner dot size
    const leafR = cellSize * 2; // corner radius for leaf shape

    // Outer ring — leaf shape (rounded TL + BR, sharp TR + BL)
    parts.push(leafRect(x, y, s7, s7, leafR, fgColor));
    // Inner gap — same leaf shape, cut out
    const gapX = x + cellSize;
    const gapY = y + cellSize;
    parts.push(leafRect(gapX, gapY, s5, s5, leafR * 0.7, bgColor === "transparent" ? "#18512d" : bgColor));
    // Center dot — leaf shape
    const dotX = x + 2 * cellSize;
    const dotY = y + 2 * cellSize;
    parts.push(leafRect(dotX, dotY, s3, s3, leafR * 0.5, fgColor));
  }

  parts.push("</svg>");

  const svg = parts.join("\n");
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * SVG path for a rectangle with only top-left and bottom-right corners rounded
 * (the EMN "leaf" shape). Top-right and bottom-left are sharp.
 */
function leafRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
): string {
  // Clamp radius
  const cr = Math.min(r, w / 2, h / 2);

  // Path: start at top-left (after the TL arc), go clockwise
  // TL = rounded, TR = sharp, BR = rounded, BL = sharp
  const d = [
    `M ${x} ${y + cr}`,           // start below TL curve
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`, // TL arc
    `L ${x + w} ${y}`,            // top edge → TR (sharp)
    `L ${x + w} ${y + h - cr}`,   // right edge → before BR arc
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`, // BR arc
    `L ${x} ${y + h}`,            // bottom edge → BL (sharp)
    `Z`,                           // close back to start
  ].join(" ");

  return `<path d="${d}" fill="${fill}" />`;
}
