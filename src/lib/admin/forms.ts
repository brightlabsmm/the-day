import { zonedParts } from "@/lib/i18n/datetime";

/** Reads `<name>_my` / `<name>_en` form fields into a {my, en} object, dropping empty languages. */
export function i18nFromForm(form: FormData, name: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of ["my", "en"] as const) {
    const v = String(form.get(`${name}_${lang}`) ?? "").trim();
    if (v) out[lang] = v.slice(0, 2000);
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** UTC instant → "YYYY-MM-DDTHH:mm" wall clock in the wedding's timezone (for datetime-local inputs). */
export function isoToLocalInput(iso: string | null, timeZone: string): string {
  if (!iso) return "";
  const d = zonedParts(iso, timeZone);
  return `${d.year}-${pad(d.month)}-${pad(d.day)}T${pad(d.hour)}:${pad(d.minute)}`;
}

/** Wall clock "YYYY-MM-DDTHH:mm" in `timeZone` → ISO instant. Returns null if the input is not valid. */
export function localInputToIso(value: string, timeZone: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Find the zone's offset at that moment, then correct once more across DST edges.
  let guess = asUtc;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(new Date(guess).toISOString(), timeZone);
    guess = asUtc - (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess);
  }
  const date = new Date(guess);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ── List content typed into text boxes ──────────────────────────
// One box per language; items line up by position. Items are separated by a
// blank line. FAQ: first line question, the rest answer. Story: first line
// label, second line title, the rest text. Colours: one "#hex Name" per line.

type Lang = "my" | "en";
const LANGS: Lang[] = ["en", "my"];

/** Splits text into blocks separated by blank lines; each block is its trimmed, non-empty lines. */
export function parseBlocks(text: string): string[][] {
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((b) => b.length > 0);
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").slice(0, 20000);
const only = (o: Record<string, string>) => (Object.keys(o).length ? o : undefined);

export function faqFromForm(form: FormData) {
  const blocks = Object.fromEntries(LANGS.map((l) => [l, parseBlocks(field(form, `faq_${l}`))])) as Record<Lang, string[][]>;
  const n = Math.min(40, Math.max(blocks.en.length, blocks.my.length));
  const items = [];
  for (let i = 0; i < n; i++) {
    const q: Record<string, string> = {};
    const a: Record<string, string> = {};
    for (const l of LANGS) {
      const b = blocks[l][i];
      if (b?.[0]) q[l] = b[0].slice(0, 300);
      if (b && b.length > 1) a[l] = b.slice(1).join("\n").slice(0, 2000);
    }
    if (Object.keys(q).length) items.push({ q, a });
  }
  return items;
}

/** Good-to-know tips: first line of each block is the title, the rest is the text. */
export function tipsFromForm(form: FormData) {
  const blocks = Object.fromEntries(LANGS.map((l) => [l, parseBlocks(field(form, `tips_${l}`))])) as Record<Lang, string[][]>;
  const n = Math.min(20, Math.max(blocks.en.length, blocks.my.length));
  const items = [];
  for (let i = 0; i < n; i++) {
    const title: Record<string, string> = {};
    const text: Record<string, string> = {};
    for (const l of LANGS) {
      const b = blocks[l][i];
      if (b?.[0]) title[l] = b[0].slice(0, 120);
      if (b && b.length > 1) text[l] = b.slice(1).join("\n").slice(0, 1000);
    }
    if (Object.keys(title).length) items.push({ title, text });
  }
  return items;
}

export function storyFromForm(form: FormData) {
  const blocks = Object.fromEntries(LANGS.map((l) => [l, parseBlocks(field(form, `story_${l}`))])) as Record<Lang, string[][]>;
  const n = Math.min(20, Math.max(blocks.en.length, blocks.my.length));
  const items = [];
  for (let i = 0; i < n; i++) {
    const label: Record<string, string> = {};
    const title: Record<string, string> = {};
    const text: Record<string, string> = {};
    for (const l of LANGS) {
      const b = blocks[l][i];
      if (!b) continue;
      if (b[0]) label[l] = b[0].slice(0, 80);
      if (b[1]) title[l] = b[1].slice(0, 160);
      if (b.length > 2) text[l] = b.slice(2).join("\n").slice(0, 2000);
    }
    if (Object.keys(title).length) items.push({ label: only(label), title, text: only(text) });
  }
  return items;
}

export function dressCodeFromForm(form: FormData) {
  const lines = (l: Lang) => field(form, `colors_${l}`).replace(/\r/g, "").split("\n").map((x) => x.trim()).filter(Boolean);
  const en = lines("en");
  const my = lines("my");
  const colors = [];
  for (let i = 0; i < Math.min(12, Math.max(en.length, my.length)); i++) {
    const parse = (line?: string) => {
      const m = line ? /^(#[0-9a-fA-F]{6})\s*(.*)$/.exec(line) : null;
      return m ? { hex: m[1].toLowerCase(), name: m[2].trim() } : null;
    };
    const e = parse(en[i]);
    const m = parse(my[i]);
    const hex = e?.hex ?? m?.hex;
    if (!hex) continue;
    const name: Record<string, string> = {};
    if (e?.name) name.en = e.name.slice(0, 30);
    if (m?.name) name.my = m.name.slice(0, 30);
    colors.push({ hex, name });
  }
  return { text: i18nFromForm(form, "dress_text"), colors };
}

type I18n = { my?: string; en?: string } | undefined;
const get = (v: I18n, l: Lang) => v?.[l] ?? "";

export function faqToText(faq: { q?: I18n; a?: I18n }[], l: Lang): string {
  return faq.map((f) => [get(f.q, l), get(f.a, l)].filter(Boolean).join("\n")).join("\n\n");
}
export function tipsToText(tips: { title?: I18n; text?: I18n }[], l: Lang): string {
  return tips.map((t) => [get(t.title, l), get(t.text, l)].filter(Boolean).join("\n")).join("\n\n");
}
export function storyToText(story: { label?: I18n; title?: I18n; text?: I18n }[], l: Lang): string {
  return story.map((s) => [get(s.label, l), get(s.title, l), get(s.text, l)].join("\n").trimEnd()).join("\n\n");
}
export function colorsToText(colors: { hex: string; name?: I18n }[], l: Lang): string {
  return colors.map((c) => `${c.hex} ${get(c.name, l)}`.trim()).join("\n");
}
