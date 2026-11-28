/*
 * What an invitation celebrates. Every invitation lives in the `weddings` table; a birthday is marked by
 * `cover_text.occasion = "birthday"`. Its one name is `partner_one_name` (partner two stays empty) and
 * its age line ("1st", "ပထမ") is `cover_text.age`. Keeping these in cover_text needs no database change.
 */
import type { Locale } from "./i18n/numerals";

export type Occasion = "wedding" | "birthday";

type Obj = Record<string, unknown>;
type I18n = { my?: string; en?: string };
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const text = (v: unknown, locale: Locale): string => {
  const o = obj(v) as I18n;
  return (locale === "my" ? o.my || o.en : o.en || o.my)?.trim() ?? "";
};

/** "wedding" unless the invitation is marked as a birthday. */
export const occasionOf = (coverText: unknown): Occasion => (obj(coverText).occasion === "birthday" ? "birthday" : "wedding");

/** The age line as typed, e.g. "1st" or "ပထမ"; empty when none was given. */
export const ageOf = (coverText: unknown, locale: Locale): string => text(obj(coverText).age, locale);

/** The age as stored, for forms. */
export const ageValue = (coverText: unknown): I18n => obj(obj(coverText).age) as I18n;

/** "1st Birthday" / "ပထမ မွေးနေ့", or just "Birthday" without an age. */
export function birthdayLine(age: string, locale: Locale): string {
  if (locale === "my") return age ? `${age} မွေးနေ့` : "မွေးနေ့";
  return age ? `${age} Birthday` : "Birthday";
}

/**
 * A title for the invitation: "Sacha's 1st Birthday", "စာချာ ၏ ပထမ မွေးနေ့", or "Thiha & Yadanar"
 * for a wedding.
 */
export function invitationTitle(w: { partner_one_name: unknown; partner_two_name: unknown; cover_text: unknown }, locale: Locale): string {
  const one = text(w.partner_one_name, locale);
  if (occasionOf(w.cover_text) === "birthday") {
    const line = birthdayLine(ageOf(w.cover_text, locale), locale);
    if (!one) return line;
    return locale === "my" ? `${one} ၏ ${line}` : `${one}${/s$/i.test(one) ? "’" : "’s"} ${line}`;
  }
  const two = text(w.partner_two_name, locale);
  return [one, two].filter(Boolean).join(" & ");
}
