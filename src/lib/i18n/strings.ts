import type { Locale } from "./numerals";

const STRINGS = {
  dear: { my: "ချစ်ခင်ရပါသော", en: "Dear" },
  guestFallback: { my: "ဧည့်သည်တော်", en: "Honoured Guest" },
  invitedLabel: { my: "မင်္ဂလာဖိတ်ကြားလွှာ", en: "You are invited" },
  tapToOpen: { my: "ဖွင့်ရန် တံဆိပ်ကို နှိပ်ပါ", en: "Tap the seal to open" },
  openInvitation: { my: "ဖိတ်စာကို ဖွင့်ရန်", en: "Open invitation" },
  skip: { my: "ကျော်ရန်", en: "Skip" },
  theWeddingDay: { my: "THE WEDDING DAY", en: "THE WEDDING DAY" },
  and: { my: "နှင့်", en: "and" },
} as const satisfies Record<string, Record<Locale, string>>;

export type StringKey = keyof typeof STRINGS;

export function s(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale];
}

/** The guest's name in the chosen language, falling back sensibly. */
export function guestName(
  guest: { display_name: string; display_name_my: string | null } | null,
  locale: Locale,
): string {
  if (!guest) return s("guestFallback", locale);
  return locale === "my" ? guest.display_name_my || guest.display_name : guest.display_name;
}
