import type { Locale } from "./numerals";

export const LOCALE_COOKIE = "theday_lang";
export const LOCALES: readonly Locale[] = ["my", "en"];

export function isLocale(v: unknown): v is Locale {
  return v === "my" || v === "en";
}

/**
 * Burmese is the default. A `?lang=` in the link wins (so a shared link opens
 * in the language it was sent in); otherwise the guest's last choice, saved in
 * a cookie, is used.
 */
export function resolveLocale(queryLang: unknown, cookieLang: string | undefined): Locale {
  if (isLocale(queryLang)) return queryLang;
  if (isLocale(cookieLang)) return cookieLang;
  return "my";
}
