/**
 * Builds the web logo files from the brand source (a full-colour logo on white).
 *
 *   npm run prepare:logo                     # uses reference/brand/eureka-logo-source.png
 *   npm run prepare:logo -- path/to/logo.png
 *
 * Writes:
 *   public/brand/eureka-logo.png        transparent, for light backgrounds
 *   public/brand/eureka-logo-light.png  navy turned to cream, for dark backgrounds (dark header, footer)
 *   src/app/icon.png, src/app/apple-icon.png   the "E" mark on white (favicon, home-screen icon)
 *
 * The white background is removed with colour-to-alpha (as image editors do), so
 * anti-aliased edges stay smooth on any background instead of keeping a white fringe.
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const input = process.argv[2] ?? "reference/brand/eureka-logo-source.png";
/** Height of the web logo (px): crisp at 3× for a ~48 px tall logo; next/image serves smaller sizes. */
const LOGO_HEIGHT = 168;
/** Cream used for the navy parts on dark backgrounds (the site's --on-dark). */
const CREAM = [243, 239, 231];

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

/** Colour-to-alpha against white, then (optionally) a recolour of the dark parts. */
function cutOut(recolourDark) {
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    // How far the pixel is from white; ignore the faint noise in the source's white.
    const raw = Math.max(255 - r, 255 - g, 255 - b) / 255;
    const a = Math.min(1, Math.max(0, (raw - 0.035) / 0.965));
    if (a <= 0) continue;
    // Un-blend from white: the colour that, mixed with white at this alpha, gives the pixel.
    let c = [r, g, b].map((v) => Math.min(255, Math.max(0, (v - (1 - a) * 255) / a)));
    if (recolourDark) {
      // Navy (dark) → cream; the light blue accents keep their colour; mid blues blend.
      const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
      const t = 1 - Math.min(1, Math.max(0, (lum - 0.2) / 0.32));
      c = c.map((v, k) => v + (CREAM[k] - v) * t);
    }
    out[j] = Math.round(c[0]);
    out[j + 1] = Math.round(c[1]);
    out[j + 2] = Math.round(c[2]);
    out[j + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

mkdirSync("public/brand", { recursive: true });
const trimmed = async (img) => sharp(await img.png().toBuffer()).trim({ threshold: 1 });
for (const [file, dark] of [["public/brand/eureka-logo.png", false], ["public/brand/eureka-logo-light.png", true]]) {
  const img = await trimmed(cutOut(dark));
  const meta = await img.png().toBuffer({ resolveWithObject: true });
  await sharp(meta.data).resize({ height: LOGO_HEIGHT }).png({ compressionLevel: 9, palette: false }).toFile(file);
  const m = await sharp(file).metadata();
  console.log(`${file}  ${m.width}×${m.height}`);
}

// The "E" mark (with its swoosh) for the favicon and home-screen icon: on white, padded.
// Crop measured on the 2172 × 724 source: the "E" runs from x ≈ 175 to x ≈ 530. The "u"'s top-left
// serif reaches back under the E's arm (x ≥ 508, y ≈ 270–360), so that patch is cleared before trimming.
const sx = width / 2172, sy = height / 724;
const box = { left: Math.round(150 * sx), top: Math.round(138 * sy), width: Math.round(380 * sx), height: Math.round(391 * sy) };
const serif = { left: Math.round(508 * sx) - box.left, top: Math.round(270 * sy) - box.top, width: box.left + box.width - Math.round(508 * sx), height: Math.round(90 * sy) };
const eraser = await sharp({ create: { width: serif.width, height: serif.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
const markRaw = await cutOut(false).extract(box).composite([{ input: eraser, left: serif.left, top: serif.top, blend: "dest-out" }]).png().toBuffer();
const mark = await trimmed(sharp(markRaw));
const markPng = await mark.png().toBuffer();
for (const [file, size, pad] of [["src/app/icon.png", 64, 6], ["src/app/apple-icon.png", 180, 24]]) {
  const inner = await sharp(markPng).resize({ width: size - pad * 2, height: size - pad * 2, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toFile(file);
  console.log(`${file}  ${size}×${size}`);
}
