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
import { copyFile, readdir } from "node:fs/promises";
import { importWedding } from "./import-wedding";

/** Optional real photos for a demo, kept out of git: supabase/seed-media/<key>/ (cover.jpg, p1.jpg ...). */
const MEDIA_ROOT = path.join(process.cwd(), "supabase", "seed-media");

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
  lantern: { sky: ["#2a1226", "#8a3b3b"], sun: "#ffd9a0", hills: ["#4a2038", "#7a3441", "#b5583f"], bloom: ["#ffb347", "#ffd9a0", "#f08a4b"], suit: "#26101f", gown: "#fff1de" },
  polaroid: { sky: ["#f4ead8", "#e3d2b4"], sun: "#fff6e4", hills: ["#d9c7a4", "#b9a27c", "#8f7a58"], bloom: ["#e4684f", "#f3c9b9", "#ffffff"], suit: "#2f2d2a", gown: "#fffaf0" },
  botanical: { sky: ["#eef3e4", "#cfdcc0"], sun: "#fbfdf5", hills: ["#c9d8b4", "#9db688", "#6f8f62"], bloom: ["#ffffff", "#dfe9cf", "#f3d9d0"], suit: "#2f4a34", gown: "#fbfdf6" },
  artdeco: { sky: ["#151515", "#2b2618"], sun: "#f2d479", hills: ["#2a2a2a", "#3b3417", "#5a4d22"], bloom: ["#f2d479", "#d4af37", "#ece6d6"], suit: "#0b0b0d", gown: "#f5efe0" },
  sunrise: { sky: ["#ffe9d6", "#f7bfa2"], sun: "#fff2dc", hills: ["#f6cba9", "#e9a481", "#cf7a5a"], bloom: ["#fff2dc", "#f7bfa2", "#e8825a"], suit: "#5a3a36", gown: "#fffaf2" },
  garden: { sky: ["#c9bfaa", "#a39880"], sun: "#e9dfca", hills: ["#8f836c", "#6c6250", "#463f33"], bloom: ["#e9dfca", "#c7bba2", "#f4ecdc"], suit: "#2a241d", gown: "#efe6d4" },
  ribbon: { sky: ["#f7e1e6","#efd0d8"], sun: "#ffffff", hills: ["#9fb3d6","#6f8ec4","#4468a6"], bloom: ["#f7e1e6","#ffffff","#9fb3d6"], suit: "#4468a6", gown: "#ffffff" },
  renewal: { sky: ["#faf3e1","#f1e8cf"], sun: "#ffffff", hills: ["#a9b39a","#7d8c6c","#5c6c4e"], bloom: ["#faf3e1","#d9a3b8","#f4c7b0"], suit: "#5c6c4e", gown: "#ffffff" },
  scrapbook: { sky: ["#fbf8f3","#efe7da"], sun: "#ffffff", hills: ["#d8b9aa","#c98a73","#a53a22"], bloom: ["#fbf8f3","#e9c7c0","#d7a58c"], suit: "#2c2a27", gown: "#ffffff" },
  letters: { sky: ["#9fb3cf","#d9cfbd"], sun: "#fff6e4", hills: ["#d8c79f","#b9a26f","#8a7a4f"], bloom: ["#b23a1e","#e7dbc6","#f2d37b"], suit: "#ece4d6", gown: "#e9dcc6" },
  spotlight: { sky: ["#1b1d12", "#3b3f26"], sun: "#e8d9a8", hills: ["#2c3020", "#4a5030", "#6b7144"], bloom: ["#e8d9a8", "#c9b36a", "#f3ecd2"], suit: "#14150e", gown: "#f4efdd" },
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
  { key: "lantern", one: ["Nandar", "နန္ဒာ"], two: ["Kyaw Min", "ကျော်မင်း"], mono: "N&K", tag: ["Let our love light the way", "ကျွန်ုပ်တို့ချစ်ခြင်းက လမ်းပြပါစေ"] },
  { key: "polaroid", one: ["Hnin", "ဆွေ"], two: ["Thant", "သန့်"], mono: "H&T", tag: ["Our favourite moments, developed", "ကျွန်ုပ်တို့ အကြိုက်ဆုံး အချိန်များ"] },
  { key: "botanical", one: ["Hnin Hnin", "ဟိန်းဟိန်း"], two: ["Zaw Zaw", "ဇော်ဇော်"], mono: "H&Z", tag: ["Rooted in love, growing together", "ချစ်ခြင်းအမြစ်တွယ်ကာ အတူကြီးထွားကြစို့"] },
  { key: "artdeco", one: ["Aung Aung", "အောင်အောင်"], two: ["Moe Moe", "မိုးမိုး"], mono: "A&M", tag: ["A night to remember, gilded forever", "မှတ်မိနေမည့်ညတစ်ညကို ရွှေစင်ဖြင့်"] },
  { key: "sunrise", one: ["Su Mon", "စုမွန်"], two: ["Lin Htet", "လင်းထက်"], mono: "S&L", tag: ["Every sunrise, together", "နေထွက်တိုင်း အတူတကွ"] },
  { key: "spotlight", one: ["Aria", "အာရီယာ"], two: ["Theo", "သီယို"], mono: "A&T", tag: ["The lights come up on us", "ကျွန်ုပ်တို့အပေါ် အလင်းကျလာသည်"] },
  { key: "garden", one: ["Rafe", "ရာဖေ"], two: ["Kira", "ကီရာ"], mono: "R&K", tag: ["Our love for gardens, and each other", "ဥယျာဉ်ကို ချစ်သလို တစ်ယောက်ကိုတစ်ယောက်လည်း ချစ်သည်"] },
  { key: "ribbon", one: ["Marco", "မာကို"], two: ["Katrina", "ကက်ထရီနာ"], mono: "M&K", tag: ["Invite you to their wedding on March 23, 2030", "၂၀၃၀ ခုနှစ် မတ်လ ၂၃ ရက်တွင် မင်္ဂလာဆောင်ပါမည်"] },
  { key: "renewal", one: ["Alaia", "အလိုင်ယာ"], two: ["Jeremy", "ဂျယ်ရမီ"], mono: "A&J", tag: ["Celebrate 50 years together on February 20, 2030", "၂၀၃၀ ပြည့်နှစ် ဖေဖော်ဝါရီ ၂၀ ရက်တွင် ၅၀ နှစ်ပြည့်ကို အတူကျင်းပကြပါစို့"] },
  { key: "scrapbook", one: ["Arman Buhay", "အာမန်"], two: ["Lovely Tan", "လာဗ်လီ"], mono: "A&L", tag: ["Our love for gardens (and each other!) grows", "ကျွန်ုပ်တို့၏ ချစ်ခြင်း ကြီးထွားနေသည်"] },
  { key: "letters", one: ["Riley", "Riley"], two: ["Lin", "Lin"], mono: "R&L", tag: ["Forever starts here", "Forever starts here"] },
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
    good_to_know: [
      { title: { en: "Parking", my: "ကားရပ်နားရန်" }, text: { en: "Free parking at the venue. Our ushers will guide you.", my: "နေရာတွင် အခမဲ့ရပ်နားနိုင်ပါသည်။" } },
      { title: { en: "Getting there", my: "သွားရောက်ရန်" }, text: { en: "Taxis and ride-hailing drop off at the main entrance.", my: "ပင်မဝင်ပေါက်တွင် ဆင်းနိုင်ပါသည်။" } },
      { title: { en: "Weather", my: "ရာသီဥတု" }, text: { en: "The ceremony is outdoors. Light layers are a good idea.", my: "အခမ်းအနားမှာ အပြင်တွင် ဖြစ်ပါသည်။" } },
      { title: { en: "Children", my: "ကလေးများ" }, text: { en: "Children are welcome. A quiet room is available.", my: "ကလေးများ ကြိုဆိုပါသည်။" } },
    ],
    seating_enabled: true,
    guests: [
      { name: "Ko Aung", name_my: "ကိုအောင်", table: "1" },
      { name: "Ma Hnin", name_my: "မဟိန်း", table: "1" },
      { name: "Daw Mya", name_my: "ဒေါ်မြ", table: "2" },
      { name: "U Kyaw", name_my: "ဦးကျော်", table: "3" },
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

/**
 * Garden is a copy of one published design, so its demo uses that design's own wording, word for
 * word, instead of the generic sample text. The Burmese lines are translations and need a native check.
 */
const VENUE = { en: "The Sunroom at Rizal Gardens" };
const GARDEN_ADDRESS = {
  en: "Our reception will take place in The Sunroom at Rizal Gardens — an open-air garden space. The celebration will be outdoors, so expect fresh air, soft grass, and lots of golden hour glow.",
};
function gardenFixed() {
  const ev = (time: string, kind: "ceremony" | "reception" | "other", en: string) => ({
    kind,
    title: { en },
    starts_at_local: `2035-04-27T${time}`,
    venue_name: VENUE,
    venue_address: GARDEN_ADDRESS,
  });
  return {
    partner_one_name: { en: "Rafael" },
    partner_two_name: { en: "Kirsten" },
    monogram: "R&K",
    tagline: { en: "Our love for gardens (and each other)" },
    invitation_text: {
      en: "Write a paragraph that tells your story as a couple. You can include details like how you met, your journey together, and what makes your relationship unique. This is your chance to share your personality and connect with your guests,",
    },
    closing_quote: {},
    cover_text: { english_only: true, contact: [{ text: "the-day.brightlabsmm.com", href: "https://the-day.brightlabsmm.com/" }, { text: "@theday", href: "https://www.facebook.com/people/The-Day-E-Invitation-Service/61597006130300/" }] },
    wishes_enabled: false,
    public_wishes: false,
    seating_enabled: false,
    guests: [],
    faq: [],
    story: [],
    dress_code: {
      text: {
        en: "Garden party chic! Flowy, breathable fabrics and comfortable shoes (heels are optional, sinking in the grass is not required). Pastel colors are preferred but not mandatory!",
      },
      colors: [],
    },
    good_to_know: [
      {
        text: {
          en: "Free parking is available on-site, with designated areas for PWDs and senior guests. If you need special assistance or a drop-off closer to the garden entrance, let us know.",
        },
      },
    ],
    note: {
      en: "But if you feel called to give a little something, we’ve put together a small registry with some of our most wished-for items at Sining Spaces.\n\nScan the QR on this page or send an email to hello@reallygreatsite.com with the Registry No. 12345 as the subject line for our updated gift list.",
    },
    events: [
      ev("17:00", "other", "Welcome Photos & Cocktails"),
      ev("18:00", "ceremony", "Dinner Program"),
      ev("19:00", "reception", "Toasts & Speeches"),
      ev("20:00", "other", "Official Picture Taking"),
      ev("21:00", "other", "Open Bar & Dancing"),
    ],
  };
}

/** Blue Ribbon is a copy of one published design too: every line of its wording is kept as published. English only. */
function ribbonFixed() {
  const place = { en: "Solana Gardens" };
  const ev = (time: string, kind: "ceremony" | "reception" | "other", en: string) => ({
    kind,
    title: { en },
    starts_at_local: `2030-03-23T${time}`,
    venue_name: place,
    venue_address: { en: "Our ceremony will be held in the garden of Solana Gardens, surrounded by greenery, soft blooms, and the people we love most." },
  });
  const intro = "Share details about your ceremony, reception, or any other program related thing here.";
  return {
    partner_one_name: { en: "Marco" },
    partner_two_name: { en: "Katrina" },
    monogram: "M&K",
    tagline: { en: "Invite you to their wedding on March 23, 2030" },
    invitation_text: { en: "" },
    closing_quote: {},
    cover_text: {
      english_only: true,
      ribbon: {
        intro: { title: "Our wedding, close to nature", text: `${intro} ${intro} ${intro}` },
        about: {
          title: "About the Wedding",
          sub: "Important details about our outdoor wedding",
          items: [
            { icon: "church", title: "Ceremony", text: "Our ceremony will be held in the garden of Solana Gardens, surrounded by greenery, soft blooms, and the people we love most." },
            { icon: "dancers", title: "Reception", text: "We’ll move straight into cocktails and an alfresco dinner under the trees. Expect an easygoing atmosphere, lots of laughter, and a few surprises." },
            { icon: "shoes", title: "Dress Code", text: "Garden formal. Think flowy, breathable fabrics and shoes that work on grass. We recommend bringing a light layer for the evening breeze." },
          ],
        },
        schedule: {
          title: "Schedule of Events",
          items: [
            { time: "3:00 PM", title: "Garden Ceremony", text: "We begin our celebration with a short, heartfelt ceremony under the trees." },
            { time: "5:30 PM", title: "Dinner Reception", text: "A laid-back al fresco dinner under the lights." },
            { time: "4:30 PM", title: "Cocktail Hour & Photos", text: "Enjoy light bites, refreshing drinks, and golden hour mingling while we take photos with family and friends." },
            { time: "7:00 PM", title: "Dancing & Open Bar", text: "Let’s end the night with music, drinks (we serve non-alcoholic, too!), and a little dancing under the stars." },
          ],
          note: "We recommend arriving at",
          noteBold: "2:00 PM",
          noteAfter: "for pictures, welcome drinks, and getting settled.",
        },
        gift: {
          title: "Gift Registry",
          line: "Your presence is truly the best gift we could ask for.",
          paragraphs: [
            "But if you feel called to give a little something, we’ve put together a small registry with some of our most wished-for items at Sining Spaces. Email hello@reallygreatsite.com with the Registry No. 12345 as the subject line for our updated gift list.",
            "Alternatively, if you prefer to support us as we begin our married life, a contribution to our future would mean so much. Scan the QR on this page or email us at hello@reallygreatsite.com for our details.",
            "Thank you for being part of this milestone with us.",
          ],
        },
        faqTitle: "Frequently-asked-Qs",
        rsvpBy: "RSVP by February 15, 2030.",
        contact: [{ text: "Telephone: (123) 456-7890" }, { text: "Mobile: (123) 456-7890" }, { text: "hello@reallygreatsite.com" }],
      },
    },
    wishes_enabled: false,
    public_wishes: false,
    seating_enabled: false,
    guests: [],
    story: [],
    good_to_know: [],
    dress_code: { text: { en: "Garden formal. Think flowy, breathable fabrics and shoes that work on grass. We recommend bringing a light layer for the evening breeze." }, colors: [] },
    faq: [
      { q: { en: "Is the entire wedding outdoors?" }, a: { en: "Yes — the ceremony and reception will both take place in the garden. We recommend wearing something comfortable and dressy, and opting for shoes that work well on grass (flats, wedges, or block heels). Covered areas will be available in case of rain." } },
      { q: { en: "Can I bring a guest or my kids?" }, a: { en: "We’d love to keep this gathering intimate, so we’re only able to accommodate those listed on the invitation. Thanks for understanding!" } },
      { q: { en: "Is there parking available?" }, a: { en: "Yes, the venue has designated parking, including spaces for seniors and PWD guests. We’ll also include a map and directions with your RSVP confirmation." } },
    ],
    note: {},
    events: [
      ev("15:00", "ceremony", "Garden Ceremony"),
      ev("16:30", "other", "Cocktail Hour & Photos"),
      ev("17:30", "reception", "Dinner Reception"),
      ev("19:00", "other", "Dancing & Open Bar"),
    ],
  };
}

/** Golden Renewal is a copy of one published design too, word for word. English only. Its flower files ride along as `art`. */
function renewalFixed() {
  const place = { en: "Sunfolk Gardens and Events Place" };
  const ev = (time: string, kind: "ceremony" | "reception" | "other", en: string) => ({
    kind,
    title: { en },
    starts_at_local: `2030-02-20T${time}`,
    venue_name: place,
  });
  return {
    partner_one_name: { en: "Alaia" },
    partner_two_name: { en: "Jeremy" },
    monogram: "A&J",
    tagline: { en: "Celebrate 50 years together on February 20, 2030" },
    invitation_text: { en: "" },
    closing_quote: {},
    cover_text: {
      english_only: true,
      renewal: {
        kicker: "A Golden Renewal",
        love: { script: "Love", text: "that transcends time" },
        about: {
          lead: "About the",
          script: "Ceremony",
          cards: [
            { title: "DATE & TIME", text: "The ceremony will take place on February 20, 2030 at 5:00 pm – just in time for the sunset!" },
            { title: "VENUE", text: "We’ve chosen the Sunfolk Gardens and Events Place, which is a convenient 30-minute drive from our home in Beechtown." },
            { title: "DRESS CODE", text: "Please come dressed in formal attire. Long gowns or cocktail dresses for the ladies, and dark suits for the gentlemen." },
          ],
        },
        program: { script: "Program", lead: "of Events", date: "FEBRUARY 20, 2030" },
        faqTitle: "FAQs",
        rsvp: {
          title: "Please RSVP",
          sub: "WITH OUR COORDINATORS BY JANUARY 5",
          people: [
            { name: "Edith Schulz", role: "COORDINATOR", address: "123 Anywhere St., Any City ST 12345", mobile: "Mobile: (123) 456-7890", email: "hello@reallygreatsite.com", flower: "hydrangea" },
            { name: "Elaine Defaux", role: "ASSISTANT COORDINATOR", address: "123 Anywhere St., Any City ST 12345", mobile: "Mobile: (123) 456-7890", email: "hello@reallygreatsite.com", flower: "magnolia" },
          ],
        },
      },
    },
    art: {
      tulip: "tulip.png",
      rose: "rose.png",
      pansy: "pansy.png",
      lily: "lily.png",
      dahlia: "dahlia.png",
      orchid: "orchid.webp",
      hydrangea: "hydrangea.webp",
      magnolia: "magnolia.png",
      "anthurium-pink": "anthurium-pink.png",
      "anthurium-red": "anthurium-red.png",
    },
    rsvp_enabled: true,
    wishes_enabled: false,
    public_wishes: false,
    seating_enabled: false,
    guests: [],
    story: [],
    good_to_know: [],
    dress_code: {},
    note: {},
    faq: [
      { q: { en: "WHAT IS YOUR PHONE POLICY DURING THE CEREMONY?" }, a: { en: "We have hired a professional photographer and videographer to document our big day. As such, we highly encourage everyone to refrain from pulling out smartphones to take photos and videos during the ceremony. Please switch all of your devices to silent mode and keep unnecessary phone use to a minimum as well." } },
      { q: { en: "WILL WHEELCHAIR ACCESS BE AVAILABLE?" }, a: { en: "Yes, our venue has multiple entries equipped with wheelchair access ramps. For anyone who’d like to request a wheelchair on the day of the ceremony, you may ask for one from any of the event personnel present." } },
      { q: { en: "WHAT IF I HAVE DIETARY RESTRICTIONS?" }, a: { en: "We request that guests with any food allergies or other dietary restrictions let Edith, our coordinator, know in advance. This is to give us ample time to coordinate with our caterer for any necessary menu adjustments." } },
    ],
    events: [
      ev("16:30", "other", "Arrival of guests"),
      ev("17:00", "ceremony", "Ceremony"),
      ev("18:00", "reception", "Dinner Program"),
      ev("20:00", "other", "Celebration"),
    ],
  };
}

/** Pressed Scrapbook is a copy of one published design too, word for word. English only; its artwork rides along as `art`. */
function scrapbookFixed() {
  const place = { en: "The Sunroom at Rizal Gardens" };
  const ev = (time: string, kind: "ceremony" | "reception" | "other", en: string) => ({
    kind,
    title: { en },
    starts_at_local: `2035-04-27T${time}`,
    venue_name: place,
  });
  return {
    partner_one_name: { en: "Arman Buhay" },
    partner_two_name: { en: "Lovely Tan" },
    monogram: "A&L",
    tagline: { en: "Our love for gardens (and each other!) grows" },
    invitation_text: { en: "" },
    closing_quote: {},
    cover_text: {
      english_only: true,
      scrapbook: {
        intro: "YOU ARE CORDIALLY INVITED TO THE WEDDING RECEPTION OF",
        dateLine: "ON APRIL 27, 2035 | 6PM",
        place: "THE SUNROOM AT RIZAL GARDENS",
        rsvpBy: "Please RSVP by March 15, 2035.",
        buttons: { rsvp: "RSVP", gift: "Gift Registry" },
        story: {
          title: "Our love for gardens (and each other!) grows",
          text: "Write a paragraph that tells your story as a couple. You can include details like how you met, your journey together, and what makes your relationship unique. This is your chance to share your personality and connect with your guests, giving them a glimpse into your love story and what this special day means to you.",
        },
        about: {
          title: "About the Reception",
          items: [
            { art: "harbour", title: "VENUE", text: "Our reception will take place in The Sunroom at Rizal Gardens — an open-air garden space. The celebration will be outdoors, so expect fresh air, soft grass, and lots of golden hour glow." },
            { art: "shoes", title: "ATTIRE", text: "Garden party chic! Flowy, breathable fabrics and comfortable shoes (heels are optional, sinking in the grass is not required). Pastel colors are preferred but not mandatory!" },
            { art: "rabbit", title: "KIDS", text: "Yes, this is a kid-friendly event. We’ll have a few child-friendly meals and cozy corners for them to relax or play while the grown-ups enjoy the night." },
            { art: "car", title: "PARKING", text: "Free parking is available on-site, with designated areas for PWDs and senior guests. If you need special assistance or a drop-off closer to the garden entrance, let us know — we’ll be happy to help." },
          ],
        },
        program: {
          title: "Program of Events",
          items: [
            { time: "5:00 PM", title: "Welcome Photos & Cocktails" },
            { time: "6:00 PM", title: "Dinner Program" },
            { time: "7:00PM", title: "Toasts & Speeches" },
            { time: "8:00 PM", title: "Open Bar & Dancing" },
          ],
        },
        meta: { left: "#LOVELYEVERARMAN", right: "April 27, 2035 | 6:00PM at The Sunroom" },
        gift: {
          title: "Gift Registry",
          line: "YOUR PRESENCE IS TRULY THE BEST GIFT WE COULD ASK FOR.",
          paragraphs: [
            "But if you feel called to give a little something, we’ve put together a small registry with some of our most wished-for items at Sining Spaces. Email hello@reallygreatsite.com with the Registry No. 12345 as the subject line for our updated gift list.",
            "Alternatively, if you prefer to support us as we begin our married life, a contribution to our future would mean so much. Scan the QR on this page or email us at hello@reallygreatsite.com for our details.",
          ],
          thanks: "Thank you for being part of this milestone with us.",
        },
        contact: {
          lead: "FOR RELATED QUESTIONS OR CONCERNS, PLEASE CONTACT US AT:",
          people: [
            { name: "Arman Buhay", phone: "(123) 456-7890", email: "hello@reallygreatsite.com", tone: "blue" },
            { name: "Lovely Tan", phone: "(123) 456-7890", email: "hello@reallygreatsite.com", tone: "pink" },
          ],
        },
      },
    },
    art: {
      "paper-bg": "paper-bg.png",
      "paper-card": "paper-card.png",
      "shadow": "shadow.png",
      "envelope": "envelope.png",
      "tape": "tape.png",
      "butterfly": "butterfly.png",
      "strip": "strip.png",
      "red-flower": "red-flower.png",
      "petals-cream": "petals-cream.png",
      "harbour": "harbour.png",
      "shoes": "shoes.png",
      "rabbit": "rabbit.png",
      "car": "car.png",
      "petal": "petal.png",
      "mustard": "mustard.png",
      "orange": "orange.png",
      "pink-plant": "pink-plant.png",
      "pink-flower": "pink-flower.png",
      "lace": "lace.png",
      "torn": "torn.png",
      "chair": "chair.png",
      "delphinium": "delphinium.png",
      "yellow-plant": "yellow-plant.png",
      "card-blue": "card-blue.png",
      "card-pink": "card-pink.png",
    },
    rsvp_enabled: true,
    wishes_enabled: false,
    public_wishes: false,
    seating_enabled: false,
    guests: [],
    story: [],
    good_to_know: [],
    dress_code: {},
    note: {},
    faq: [],
    events: [
      ev("17:00", "other", "Welcome Photos & Cocktails"),
      ev("18:00", "ceremony", "Dinner Program"),
      ev("19:00", "reception", "Toasts & Speeches"),
      ev("20:00", "other", "Open Bar & Dancing"),
    ],
  };
}

/**
 * Love Letters follows one published save-the-date: Riley & Lin, Venston Bay, July 15. English only,
 * like the other copied designs; its contact rows and paper artwork are part of the demo.
 */
function lettersFixed() {
  const place = { en: "Venston Bay" };
  const ev = (time: string, kind: "ceremony" | "reception" | "other", en: string) => ({
    kind,
    title: { en },
    starts_at_local: `2030-07-15T${time}`,
    venue_name: place,
    venue_address: { en: "The Boathouse, 12 Shore Road, Venston Bay" },
    map_url: "https://www.google.com/maps/search/?api=1&query=Venston+Bay",
  });
  return {
    partner_one_name: { en: "Riley" },
    partner_two_name: { en: "Lin" },
    monogram: "R&L",
    tagline: { en: "Forever starts here" },
    invitation_text: {
      en: "We met with a letter and we are marrying with one. Please keep the date, bring your warmest smile, and celebrate with us by the bay. [Sample wording]",
    },
    closing_quote: { en: "Yours, always." },
    cover_text: {
      english_only: true,
      contact: [
        { label: "Phone", text: "(123) 456-7890" },
        { label: "Email", text: "hello@reallygreatsite.com" },
        { label: "Social", text: "@reallygreatsite" },
      ],
    },
    dress_code: {
      text: { en: "Garden party chic. Soft, natural tones photograph beautifully." },
      colors: [
        { hex: "#b23a1e", name: { en: "Rust" } },
        { hex: "#c9ad89", name: { en: "Sand" } },
        { hex: "#efe5d4", name: { en: "Ivory" } },
        { hex: "#2e2a26", name: { en: "Charcoal" } },
      ],
    },
    good_to_know: [
      { title: { en: "Parking" }, text: { en: "Free parking at the boathouse. Our ushers will guide you." } },
      { title: { en: "Weather" }, text: { en: "The ceremony is by the water. A light layer for the evening breeze is a good idea." } },
      { title: { en: "Children" }, text: { en: "Children are welcome." } },
    ],
    faq: [
      { q: { en: "What time should I arrive?" }, a: { en: "Please arrive by 3:30 PM so you can find your seat before the ceremony." } },
      { q: { en: "Is parking available?" }, a: { en: "Yes, free parking is available at the venue." } },
    ],
    guests: [
      { name: "Ko Aung", table: "1" },
      { name: "Ma Hnin", table: "2" },
    ],
    story: [],
    events: [
      ev("15:30", "other", "Guests arrive"),
      ev("16:00", "ceremony", "The ceremony"),
      ev("17:30", "reception", "Dinner by the water"),
      ev("19:30", "other", "Dancing"),
    ],
    art: {
      "love-letter": "love-letter.webp",
      letters: "letters.webp",
      manuscript: "manuscript.webp",
      torn: "torn.png",
      "tape-clear": "tape-clear.png",
      washi: "washi.png",
      polaroid: "polaroid.png",
      "flower-white": "flower-white.png",
      "flower-yellow": "flower-yellow.webp",
      "flower-red": "flower-red.png",
    },
  };
}

async function main() {
  const only = process.argv.slice(2);
  for (const [n, d] of DEMOS.entries()) {
    if (only.length && !only.includes(d.key)) continue;
    const dir = await mkdtemp(path.join(os.tmpdir(), `showcase-${d.key}-`));
    try {
      const pal = PALETTES[d.key];
      const mediaDir = path.join(MEDIA_ROOT, d.key);
      const real = await readdir(mediaDir).catch(() => [] as string[]);
      const useReal = real.includes("cover.jpg");
      if (useReal) {
        for (const f of real) await copyFile(path.join(mediaDir, f), path.join(dir, f));
      } else {
        for (const [i, s] of SIZES.entries()) {
          const svg = scene(n * 100 + i + 1, pal, s.w, s.h, s.figures);
          await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(path.join(dir, s.name));
        }
      }
      const qr = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="#fff"/><rect x="24" y="24" width="432" height="432" fill="none" stroke="#555" stroke-width="6" stroke-dasharray="14 10"/><text x="240" y="230" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#555">DEMO</text><text x="240" y="280" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#555">QR CODE</text></svg>`;
      await sharp(Buffer.from(qr)).png().toFile(path.join(dir, "qr.png"));
      const song = d.key === "record" ? await demoTrack(dir) : null;
      const cfg = { ...config(d), ...(d.key === "garden" ? gardenFixed() : d.key === "ribbon" ? ribbonFixed() : d.key === "renewal" ? renewalFixed() : d.key === "scrapbook" ? scrapbookFixed() : d.key === "letters" ? lettersFixed() : {}) };
      if (useReal) {
        cfg.photos = real
          .filter((f) => f.endsWith(".jpg"))
          .sort((a, b) => (a === "cover.jpg" ? -1 : b === "cover.jpg" ? 1 : a.localeCompare(b, undefined, { numeric: true })))
          .map((f) => ({ file: f, kind: "portrait" as const, cover: f === "cover.jpg", alt: { en: "Wedding photo", my: "မင်္ဂလာဓာတ်ပုံ" }, _i: 0 }));
      }
      await writeFile(
        path.join(dir, "wedding.json"),
        JSON.stringify({ ...cfg, ...(song ? { music: { file: song, title: "Demo ambient loop" } } : {}) }),
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
