// Enlarges the Canva cover export (851 x 315) into sharp Facebook cover files.
//   node docs/branding/make-cover.mjs <path to cover png> [output name prefix]
import sharp from "sharp";

const src = process.argv[2];
const prefix = process.argv[3] ?? "cover"; // output file name prefix
const BG = { r: 0xf6, g: 0xf1, b: 0xe7 }; // brand cream #F6F1E7

async function build(width, height, out) {
  // Scale the whole picture to the target width, keeping its shape.
  const meta = await sharp(src).metadata();
  const scale = width / meta.width;
  const scaledH = Math.round(meta.height * scale);
  // One combined step (sharp keeps only the last .linear call):
  //   out = a * (k * in) + b,  where k maps the source cream to the brand cream
  //   and b keeps that cream exactly where it is while darkening the lines.
  const a = 1.2;
  const k = [BG.r / 244, BG.g / 238, BG.b / 225];
  let img = sharp(src)
    .resize({ width, kernel: "lanczos3" })
    .removeAlpha()
    .linear(k.map((v) => a * v), [BG.r * (1 - a), BG.g * (1 - a), BG.b * (1 - a)])
    .sharpen({ sigma: 1.4, m1: 1.2, m2: 2.4 });
  // Cap anything lighter than the cream (pale blotches from the original export) at the cream.
  const flat = await sharp({ create: { width, height: scaledH, channels: 3, background: BG } }).png().toBuffer();
  const buf = await img.composite([{ input: flat, blend: "darken" }]).png().toBuffer();
  // Fit to the exact banner size: pad or crop the cream strip at top and bottom.
  const pad = height - scaledH;
  const canvas = sharp({ create: { width, height, channels: 3, background: BG } });
  const top = Math.round(pad / 2);
  await canvas
    .composite([{ input: buf, top: Math.max(top, 0), left: 0 }])
    .removeAlpha().png({ compressionLevel: 9 })
    .toFile(out);
  console.log(out, width, height, "scale", scale.toFixed(2));
}

await build(1640, 624, `docs/branding/${prefix}-1640x624.png`);
await build(3280, 1248, `docs/branding/${prefix}-3280x1248.png`);
