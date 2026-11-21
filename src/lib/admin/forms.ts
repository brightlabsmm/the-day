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
