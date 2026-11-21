/**
 * Creates four fictional demo weddings, one per page design, so the designs
 * can be shown at /showcase. Photos are generated artwork, not real people.
 *
 *   pnpm seed:showcase
 */
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { importWedding } from "./import-wedding";

type Palette = { sky: [string, string]; sun: string; hills: [string, string, string]; bloom: string[]; suit: string; gown: string };

const PALETTES: Record<string, Palette> = {
  classic: { sky: ["#f6e8cf", "#e8d3a8"], sun: "#fff4d6", hills: ["#c9b27a", "#a68f5b", "#7f6b3f"], bloom: ["#f4d9c2", "#e9b9a0", "#fff1e0"], suit: "#3b3a4d", gown: "#fbf5ea" },
  editorial: { sky: ["#d9d9d9", "#9d9d9d"], sun: "#f3f3f3", hills: ["#777", "#4d4d4d", "#2b2b2b"], bloom: ["#e8e8e8", "#bdbdbd", "#fafafa"], suit: "#161616", gown: "#f7f7f7" },
  envelope: { sky: ["#f7efe0", "#e8dcc3"], sun: "#fffaf0", hills: ["#b9c79a", "#93a878", "#6f8a58"], bloom: ["#f6e3d6", "#efd0bd", "#fffdf6"], suit: "#4a4a58", gown: "#fffdf7" },
  theatre: { sky: ["#3b1c1a", "#6a2b25"], sun: "#e9c279", hills: ["#7b2a30", "#5c1e27", "#3d1119"], bloom: ["#e8c987", "#c9a45a", "#fff1d0"], suit: "#161616", gown: "#fbf3e2" },
  scratch: { sky: ["#fde3e7", "#f6b8c6"], sun: "#fff6f2", hills: ["#e7a3b4", "#c97d94", "#9e5a75"], bloom: ["#ffd9df", "#f7a3b7", "#fff2f4"], suit: "#4a2b3a", gown: "#fff7f6" },
};

/** Small seeded random numbers, so every run draws the same pictures. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A soft-focus garden scene: sky, blurred hills, a floral arch and bokeh. No people. */
function scene(seed: number, p: Palette, w: number, h: number, arch: boolean): string {
  const r = rng(seed);
  const hill = (base: number, amp: number, fill: string, blur: number) => {
    const pts: string[] = [];
    const ph = r() * 6;
    for (let x = 0; x <= w; x += w / 14) pts.push(`${x.toFixed(0)},${(base + Math.sin((x / w) * 4 + ph) * amp).toFixed(0)}`);
    return `<polygon points="0,${h} ${pts.join(" ")} ${w},${h}" fill="${fill}" filter="url(#b${blur})"/>`;
  };
  const dots = (n: number, y0: number, y1: number, rMin: number, rMax: number, x0 = 0, x1 = w) =>
    Array.from({ length: n }, () => {
      const rad = (rMin + r() * (rMax - rMin)) * (w / 1200);
      return `<circle cx="${(x0 + r() * (x1 - x0)).toFixed(0)}" cy="${(h * (y0 + r() * (y1 - y0))).toFixed(0)}" r="${rad.toFixed(1)}" fill="${p.bloom[Math.floor(r() * p.bloom.length)]}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
    }).join("");
  const cx = w / 2;
  const archSvg = arch
    ? `<g filter="url(#b2)">
         <path d="M${cx - w * 0.17} ${h * 0.92} V${h * 0.42} a${w * 0.17} ${w * 0.17} 0 0 1 ${w * 0.34} 0 V${h * 0.92}" fill="none" stroke="${p.hills[2]}" stroke-width="${w * 0.012}" opacity=".55"/>
         ${dots(90, 0.28, 0.9, 8, 24, cx - w * 0.2, cx - w * 0.13)}
         ${dots(90, 0.28, 0.9, 8, 24, cx + w * 0.13, cx + w * 0.2)}
         ${dots(60, 0.22, 0.34, 8, 22, cx - w * 0.19, cx + w * 0.19)}
       </g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
      <filter id="sun"><feGaussianBlur stdDeviation="${w / 28}"/></filter>
      <filter id="b2"><feGaussianBlur stdDeviation="${w / 400}"/></filter>
      <filter id="b6"><feGaussianBlur stdDeviation="${w / 160}"/></filter>
      <filter id="b14"><feGaussianBlur stdDeviation="${w / 80}"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    <circle cx="${w * (0.25 + r() * 0.5)}" cy="${h * 0.28}" r="${h * 0.24}" fill="${p.sun}" opacity=".9" filter="url(#sun)"/>
    ${hill(h * 0.58, h * 0.05, p.hills[0], 14)}
    ${hill(h * 0.7, h * 0.04, p.hills[1], 6)}
    ${hill(h * 0.82, h * 0.03, p.hills[2], 2)}
    ${archSvg}
    <g filter="url(#b6)">${dots(40, 0.78, 1, 14, 34)}</g>
    <g filter="url(#b2)">${dots(55, 0.82, 1, 6, 16)}</g>
    <g filter="url(#b14)" opacity=".5">${dots(14, 0.05, 0.6, 28, 70)}</g>
  </svg>`;
}

const SIZES = [
  { name: "cover.jpg", w: 2000, h: 1333, figures: true, kind: "couple" as const, cover: true },
  { name: "p1.jpg", w: 1200, h: 1500, figures: true, kind: "portrait" as const },
  { name: "p2.jpg", w: 1200, h: 1500, figures: false, kind: "portrait" as const },
  { name: "p3.jpg", w: 1500, h: 1000, figures: true, kind: "couple" as const },
  { name: "p4.jpg", w: 1200, h: 1500, figures: true, kind: "portrait" as const },
  { name: "p5.jpg", w: 1200, h: 1500, figures: false, kind: "portrait" as const },
  { name: "p6.jpg", w: 2000, h: 1000, figures: false, kind: "spread" as const },
];

const DEMOS = [
  { key: "classic", one: ["Thiha", "သီဟ"], two: ["Yadanar", "ရတနာ"], mono: "T&Y", tag: ["Two hearts, one journey, forever", "နှလုံးသားနှစ်ခု၊ ခရီးတစ်ခု၊ ထာဝရ"] },
  { key: "editorial", one: ["Zaw Lin", "ဇော်လင်း"], two: ["Su Hlaing", "စုလှိုင်"], mono: "Z&S", tag: ["Beloved / Timeless / Eternity", "ချစ်ခြင်း၊ ထာဝရ၊ အမြဲတမ်း"] },
  { key: "envelope", one: ["Htet Aung", "ထက်အောင်"], two: ["Nandar", "နန္ဒာ"], mono: "H&N", tag: ["Together, from this day on", "ယနေ့မှစ၍ အတူတကွ"] },
  { key: "theatre", one: ["Min Thu", "မင်းသူ"], two: ["Thazin", "သဇင်"], mono: "M&T", tag: ["Every love story deserves a stage", "ချစ်ဇာတ်လမ်းတိုင်း ဇာတ်ခုံတစ်ခု ရှိသင့်ပါသည်"] },
  { key: "scratch", one: ["Kaung Myat", "ကောင်းမြတ်"], two: ["Phoo Pwint", "ဖူးပွင့်"], mono: "K&P", tag: ["Love, one scratch at a time", "ချစ်ခြင်းမေတ္တာ"] },
] as const;

function config(d: (typeof DEMOS)[number]) {
  return {
    slug: `showcase-${d.key}`,
    status: "published",
    timezone: "Asia/Yangon",
    template_key: d.key,
    partner_one_name: { en: d.one[0], my: d.one[1] },
    partner_two_name: { en: d.two[0], my: d.two[1] },
    monogram: d.mono,
    tagline: { en: d.tag[0], my: d.tag[1] },
    invitation_text: {
      en: `Together with our families, ${d.one[0]} and ${d.two[0]} joyfully invite you to celebrate their wedding. [Sample wording]`,
      my: "မိသားစုများနှင့်အတူ ကျွန်ုပ်တို့၏ မင်္ဂလာအခမ်းအနားသို့ ကြွရောက်ချီးမြှင့်ပေးပါရန် လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်။ [နမူနာစာသား]",
    },
    closing_quote: { en: "A day to be kept safe in the heart.", my: "နှလုံးသားထဲမှာ သိမ်းဆည်းထားမယ့် နေ့တစ်နေ့" },
    cover_text: {
      corner_left: { en: "Our\nSpecial\nDay" },
      corner_right: { en: "Sample\nCouple\nEst. 2027" },
    },
    wishes_enabled: true,
    wishes_editable: false,
    public_wishes: true,
    events: [
      { kind: "ceremony", title: { en: "Guest Arrival", my: "ဧည့်သည်များ လာရောက်ချိန်" }, starts_at_local: "2027-02-14T10:30", venue_name: { en: "Sample Garden Hotel", my: "နမူနာ ဥယျာဉ်ဟိုတယ်" }, venue_address: { en: "No. 1, Sample Road, Yangon", my: "နမူနာလမ်း၊ ရန်ကုန်မြို့" }, map_url: "https://www.google.com/maps/search/?api=1&query=Yangon" },
      { kind: "ceremony", title: { en: "Wedding Ceremony", my: "မင်္ဂလာအခမ်းအနား" }, starts_at_local: "2027-02-14T11:00", ends_at_local: "2027-02-14T12:00", venue_name: { en: "Sample Garden Hotel", my: "နမူနာ ဥယျာဉ်ဟိုတယ်" } },
      { kind: "reception", title: { en: "Lunch Reception", my: "ညစာ/နေ့လည်စာ ညည့်ခံပွဲ" }, starts_at_local: "2027-02-14T12:30", ends_at_local: "2027-02-14T14:30", venue_name: { en: "Sample Garden Hotel", my: "နမူနာ ဥယျာဉ်ဟိုတယ်" } },
      { kind: "other", title: { en: "Photos and Farewell", my: "ဓာတ်ပုံရိုက်ပြီး နှုတ်ဆက်ခြင်း" }, starts_at_local: "2027-02-14T14:30", venue_name: { en: "Sample Garden Hotel", my: "နမူနာ ဥယျာဉ်ဟိုတယ်" } },
    ],
    photos: SIZES.map((s, i) => ({
      file: s.name,
      kind: s.kind,
      cover: !!s.cover,
      alt: { en: "Illustrated placeholder scene", my: "နမူနာ ပုံ" },
      _i: i,
    })),
    gifts: [{ label: "Sample QR (demo)", account_name: d.one[0], file: "qr.png" }],
  };
}

async function main() {
  for (const [n, d] of DEMOS.entries()) {
    const dir = await mkdtemp(path.join(os.tmpdir(), `showcase-${d.key}-`));
    try {
      const pal = PALETTES[d.key];
      for (const [i, s] of SIZES.entries()) {
        const svg = scene(n * 100 + i + 1, pal, s.w, s.h, s.figures);
        await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(path.join(dir, s.name));
      }
      const qr = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="#fff"/><rect x="24" y="24" width="432" height="432" fill="none" stroke="#555" stroke-width="6" stroke-dasharray="14 10"/><text x="240" y="230" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#555">DEMO</text><text x="240" y="280" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#555">QR CODE</text></svg>`;
      await sharp(Buffer.from(qr)).png().toFile(path.join(dir, "qr.png"));
      await writeFile(path.join(dir, "wedding.json"), JSON.stringify(config(d)));
      await importWedding(dir);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
