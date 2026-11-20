export type Locale = "my" | "en";

const MY_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

/** Replaces Western digits 0–9 with Myanmar digits ၀–၉. */
export function toMyanmarDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => MY_DIGITS[Number(d)]);
}

/** Formats a number for the given locale, optionally zero-padded. */
export function formatNumber(n: number, locale: Locale, pad = 0): string {
  const s = String(n).padStart(pad, "0");
  return locale === "my" ? toMyanmarDigits(s) : s;
}

/** Picks the right language from a {my, en} field, falling back to the other. */
export function t(field: Partial<Record<Locale, string>> | null | undefined, locale: Locale): string {
  if (!field) return "";
  return field[locale] || field[locale === "my" ? "en" : "my"] || "";
}
