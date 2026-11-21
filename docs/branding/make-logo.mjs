// Draws the "The day" phone-and-envelope logo as SVG and renders PNGs.
//   node docs/branding/make-logo.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SW = 19; // one line weight everywhere, so it survives small sizes

/** A symmetrical heart outline centred on (cx, cy). */
function heart(cx, cy, s, sw) {
  const p = (px, py) => `${(cx + px * s).toFixed(1)} ${(cy + py * s).toFixed(1)}`;
  return `<path d="M${p(0, 0.55)} C${p(-0.75, 0)} ${p(-0.8, -0.6)} ${p(-0.4, -0.65)} C${p(-0.15, -0.68)} ${p(0, -0.5)} ${p(0, -0.35)} C${p(0, -0.5)} ${p(0.15, -0.68)} ${p(0.4, -0.65)} C${p(0.8, -0.6)} ${p(0.75, 0)} ${p(0, 0.55)}Z" fill="none" stroke-width="${sw}"/>`;
}

function rays() {
  const cx = 748, cy = 318;
  return [-100, -58, -16]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const x1 = cx + Math.cos(a) * 50, y1 = cy + Math.sin(a) * 50;
      const x2 = cx + Math.cos(a) * 92, y2 = cy + Math.sin(a) * 92;
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
    })
    .join("");
}

/** The icon, drawn on a 1000x1000 canvas. Back to front: phone, open flap, letter, envelope front. */
function icon() {
  return `
  <g transform="translate(500 470) scale(.9) rotate(-6) translate(-500 -490)" stroke-linecap="round" stroke-linejoin="round" stroke-width="${SW}">
    <!-- phone -->
    <rect x="350" y="220" width="300" height="560" rx="62" fill="var(--bg)"/>
    <path d="M462 738 H538"/>
    <!-- the letter rising out of the envelope, with the heart -->
    <rect x="412" y="270" width="176" height="200" rx="20" fill="var(--bg)"/>
    ${heart(500, 352, 56, 17)}
    <!-- envelope front -->
    <rect x="322" y="452" width="356" height="196" rx="30" fill="var(--bg)"/>
    <path d="M334 470 L500 578 L666 470" fill="none"/>
    <!-- sparkles -->
    ${rays()}
  </g>`;
}

function svg({ bg, fg, text, size = 1000, big = false }) {
  const fill = bg ?? "none";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${size}" height="${size}" style="--bg:${bg ?? "#ffffff"}">
  ${bg ? `<rect width="1000" height="1000" fill="${bg}"/>` : ""}
  <g stroke="${fg}" fill="none" transform="${big ? "translate(8 70) translate(500 435) scale(1.3) translate(-500 -435)" : `translate(0 ${text ? -30 : 40})`}">
    ${icon().replaceAll("var(--bg)", bg ?? "none")}
  </g>
  ${text ? `<text x="500" y="890" text-anchor="middle" font-family="Charter, Georgia, serif" font-weight="700" font-size="132" letter-spacing="0" fill="${fg}">The day</text>` : ""}
</svg>`;
}

const variants = [
  { name: "logo-black-on-white", bg: "#ffffff", fg: "#000000", text: true },
  { name: "logo-white-on-black", bg: "#000000", fg: "#ffffff", text: true },
  { name: "logo-black-transparent", bg: null, fg: "#000000", text: true },
  { name: "icon-black-transparent", bg: null, fg: "#000000", text: false },
  { name: "icon-white-on-black", bg: "#000000", fg: "#ffffff", text: false },
  // For the round profile picture: icon only, enlarged to fill the circle.
  { name: "avatar-white-on-black", bg: "#000000", fg: "#ffffff", text: false, big: true },
  { name: "avatar-black-on-white", bg: "#ffffff", fg: "#000000", text: false, big: true },
];

for (const v of variants) {
  const s = svg(v);
  await writeFile(`docs/branding/${v.name}.svg`, s);
  await sharp(Buffer.from(svg({ ...v, size: 2000 })), { density: 144 }).resize(2000, 2000).png().toFile(`docs/branding/${v.name}.png`);
}

// Preview: the way Facebook shows a profile picture (circle), at three sizes.
const sizes = [200, 100, 50];
const tiles = await Promise.all(
  [["avatar-white-on-black", "#000000"], ["avatar-black-on-white", "#ffffff"]].flatMap(([name, bg]) =>
    sizes.map(async (px) => {
      const circle = Buffer.from(`<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}"/></svg>`);
      return sharp(`docs/branding/${name}.png`).resize(px, px).composite([{ input: circle, blend: "dest-in" }]).png().toBuffer();
    }),
  ),
);
const W = 200 + 100 + 50 + 4 * 40, H = 2 * 200 + 3 * 40;
let x = 40, row = 0;
const comps = [];
tiles.forEach((buf, i) => {
  if (i === 3) { x = 40; row = 1; }
  const px = sizes[i % 3];
  comps.push({ input: buf, left: x, top: 40 + row * 240 });
  x += px + 40;
});
await sharp({ create: { width: W, height: H, channels: 3, background: "#e9e5df" } }).composite(comps).png().toFile("docs/branding/preview-circle-sizes.png");
console.log("done");
