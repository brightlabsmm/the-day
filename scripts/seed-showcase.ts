/**
 * Creates four fictional demo weddings, one per page design, so the designs
 * can be shown at /showcase. Photos are generated artwork, not real people.
 *
 *   pnpm seed:showcase
 */
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { importWedding } from "./import-wedding";

type Palette = { sky: [string, string]; sun: string; hills: [string, string, string]; bloom: string[]; suit: string; gown: string };

const PALETTES: Record<string, Palette> = {
  classic: { sky: ["#f6e8cf", "#e8d3a8"], sun: "#fff4d6", hills: ["#c9b27a", "#a68f5b", "#7f6b3f"], bloom: ["#f4d9c2", "#e9b9a0", "#fff1e0"], suit: "#3b3a4d", gown: "#fbf5ea" },
  editorial: { sky: ["#d9d9d9", "#9d9d9d"], sun: "#f3f3f3", hills: ["#777", "#4d4d4d", "#2b2b2b"], bloom: ["#e8e8e8", "#bdbdbd", "#fafafa"], suit: "#161616", gown: "#f7f7f7" },
  envelope: { sky: ["#f7efe0", "#e8dcc3"], sun: "#fffaf0", hills: ["#b9c79a", "#93a878", "#6f8a58"], bloom: ["#f6e3d6", "#efd0bd", "#fffdf6"], suit: "#4a4a58", gown: "#fffdf7" },
  theatre: { sky: ["#3b1c1a", "#6a2b25"], sun: "#e9c279", hills: ["#7b2a30", "#5c1e27", "#3d1119"], bloom: ["#e8c987", "#c9a45a", "#fff1d0"], suit: "#161616", gown: "#fbf3e2" },
  record: { sky: ["#e7f4f9", "#bfe0ec"], sun: "#fffdf4", hills: ["#d9cba7", "#7fb7c4", "#4c8ea3"], bloom: ["#ffffff", "#e8f6fb", "#cfe9f3"], suit: "#2e4378", gown: "#ffffff" },
  wildflower: { sky: ["#fcf3ea", "#f3dccb"], sun: "#fff6ec", hills: ["#c7d0a8", "#9fb08a", "#6f8460"], bloom: ["#f1b5a5", "#a9bbe0", "#f6d2c3", "#f3d37b"], suit: "#55573c", gown: "#fff9f2" },
  shutters: { sky: ["#eaf4fb", "#bcd9ee"], sun: "#fffdf0", hills: ["#e9dfcc", "#7fb0d6", "#3f78b5"], bloom: ["#d9487a", "#f2a3bf", "#ffffff", "#f7c9d9"], suit: "#1e4f9c", gown: "#ffffff" },
  silk: { sky: ["#faf1e8", "#efd9c9"], sun: "#fffaf2", hills: ["#e9d8c8", "#cdb5a2", "#a99683"], bloom: ["#ffffff", "#f6e7dc", "#e7cdbd", "#cfd8c1"], suit: "#565a49", gown: "#ffffff" },
  midnight: { sky: ["#10193a", "#27386b"], sun: "#f3e2b0", hills: ["#1c2a55", "#2d3f78", "#41579a"], bloom: ["#f3e2b0", "#d9b66a", "#c7d2f2"], suit: "#0c1330", gown: "#f4efe3" },
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
  { key: "record", one: ["Nay Chi", "နေချီ"], two: ["Wai Yan", "ဝေယံ"], mono: "N&W", tag: ["Our song, our story", "ကျွန်ုပ်တို့၏ သီချင်း၊ ကျွန်ုပ်တို့၏ ဇာတ်လမ်း"] },
  { key: "wildflower", one: ["Su Su", "စုစု"], two: ["Min Min", "မင်းမင်း"], mono: "S&M", tag: ["Grown together, in bloom", "အတူတကွ ပွင့်လန်းခဲ့သည်"] },
  { key: "shutters", one: ["Zin Ko", "ဇင်ကို"], two: ["Yu Yu", "ယုယု"], mono: "Z&Y", tag: ["Open the windows to our day", "ကျွန်ုပ်တို့နေ့ကို ဖွင့်လှစ်ကြပါစို့"] },
  { key: "silk", one: ["Aye Mon", "အေးမွန်"], two: ["Htoo Lwin", "ထူးလွင်"], mono: "A&H", tag: ["Quietly, beautifully, together", "တိတ်ဆိတ်စွာ လှပစွာ အတူတကွ"] },
  { key: "midnight", one: ["Thiri", "သီရိ"], two: ["Zaw Lin", "ဇော်လင်း"], mono: "T&Z", tag: ["Written in the stars", "ကြယ်စုံများတွင် ရေးထိုးခဲ့သည်"] },
  { key: "scratch", one: ["Kaung Myat", "ကောင်းမြတ်"], two: ["Phoo Pwint", "ဖူးပွင့်"], mono: "K&P", tag: ["Love, one scratch at a time", "ချစ်ခြင်းမေတ္တာ"] },
] as const;

/** A short, original ambient chord loop (no copyrighted music), as an .m4a. Needs macOS afconvert. */
async function demoTrack(dir: string): Promise<string | null> {
  const rate = 22050;
  const seconds = 24;
  const chords = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 261.63, 329.63, 440], [196, 246.94, 293.66, 392]];
  const pcm = Buffer.alloc(rate * seconds * 2);
  for (let i = 0; i < rate * seconds; i++) {
    const time = i / rate;
    const idx = Math.floor(time / 6) % chords.length;
    const local = (time % 6) / 6;
    const env = Math.min(1, local * 6) * Math.min(1, (1 - local) * 6) ** 0.5; // soft in and out per chord
    let v = 0;
    for (const f of chords[idx]) v += Math.sin(2 * Math.PI * f * time) + 0.3 * Math.sin(2 * Math.PI * f * 2 * time + 0.5) + 0.12 * Math.sin(2 * Math.PI * f * 0.5 * time);
    const edge = Math.min(1, time / 1.5, (seconds - time) / 1.5);
    pcm.writeInt16LE(Math.round((v / 12) * env * edge * 28000), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  const wav = path.join(dir, "song.wav");
  const m4a = path.join(dir, "song.m4a");
  await writeFile(wav, Buffer.concat([header, pcm]));
  try {
    execFileSync("afconvert", ["-f", "m4af", "-d", "aac", wav, m4a]);
    return "song.m4a";
  } catch {
    console.warn("afconvert not available: skipping the demo song");
    return null;
  }
}

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
    rsvp_enabled: true,
    dress_code: {
      text: { en: "Formal attire, please. Soft, natural tones photograph beautifully.", my: "ယဉ်ကျေးသော ဝတ်စုံများ ဝတ်ဆင်ပေးပါရန်။ ပျော့ပျောင်းသော သဘာဝအရောင်များ ပိုလှပါသည်။" },
      colors: [
        { hex: "#5e1a27", name: { en: "Burgundy", my: "ဘာဂန်ဒီ" } },
        { hex: "#b8913f", name: { en: "Gold", my: "ရွှေ" } },
        { hex: "#e6dccb", name: { en: "Champagne", my: "ရှမ်ပိန်း" } },
        { hex: "#f6f0e4", name: { en: "Ivory", my: "ဆင်စွယ်" } },
        { hex: "#2b2b2b", name: { en: "Charcoal", my: "မီးသွေး" } },
      ],
    },
    faq: [
      { q: { en: "What should I wear?", my: "ဘာဝတ်ရမလဲ?" }, a: { en: "Formal attire. Please see the dress code above.", my: "ယဉ်ကျေးသော ဝတ်စုံ။ အပေါ်ရှိ အရောင်များကို ကြည့်ပါ။" } },
      { q: { en: "What time should I arrive?", my: "ဘယ်အချိန် ရောက်ရမလဲ?" }, a: { en: "Please arrive by 10:30 AM so you can find your seat before the ceremony.", my: "အခမ်းအနားမစမီ နေရာယူနိုင်ရန် နံနက် ၁၀:၃၀ တွင် ရောက်ပေးပါ။" } },
      { q: { en: "Is parking available?", my: "ကားရပ်နားရန် နေရာရှိပါသလား?" }, a: { en: "Yes, free parking is available at the venue.", my: "ရှိပါသည်။ နေရာတွင် အခမဲ့ရပ်နားနိုင်ပါသည်။" } },
    ],
    story: [
      { label: { en: "WINTER 2020", my: "ဆောင်းရာသီ ၂၀၂၀" }, title: { en: "The First Hello", my: "ပထမဆုံး နှုတ်ဆက်ခြင်း" }, text: { en: "A quiet evening, a shared table, and the feeling that something had shifted.", my: "တိတ်ဆိတ်သော ညနေခင်းတစ်ခုတွင် စတင်ခဲ့ပါသည်။" } },
      { label: { en: "DECEMBER 2025", my: "ဒီဇင်ဘာ ၂၀၂၅" }, title: { en: "The Question", my: "မေးခွန်း" }, text: { en: "Under the candlelight, one knee down, and a yes before the question was finished.", my: "ဖယောင်းတိုင်အလင်းအောက်တွင် 'ဟုတ်ကဲ့' ဟု ပြန်ဖြေခဲ့ပါသည်။" } },
    ],
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
      const song = d.key === "record" ? await demoTrack(dir) : null;
      await writeFile(
        path.join(dir, "wedding.json"),
        JSON.stringify({ ...config(d), ...(song ? { music: { file: song, title: "Demo ambient loop" } } : {}) }),
      );
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
