import { toMyanmarDigits, type Locale } from "./numerals";

const MY_WEEKDAYS = ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"];

type Parts = { year: number; month: number; day: number; weekday: number; hour: number; minute: number };

/** Wall-clock parts of an instant in the wedding's timezone (default Asia/Yangon). */
export function zonedParts(iso: string, timeZone: string): Parts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    weekday,
    hour: Number(p.hour),
    minute: Number(p.minute),
  };
}

/** Short cover style: "Sat 13 FEB 2027" / "၁၃-၂-၂၀၂၇ (စနေနေ့)". */
export function formatShortDate(iso: string, timeZone: string, locale: Locale): string {
  const d = zonedParts(iso, timeZone);
  if (locale === "my") {
    return `${toMyanmarDigits(`${d.day}-${d.month}-${d.year}`)} (${MY_WEEKDAYS[d.weekday]}နေ့)`;
  }
  const wd = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(new Date(iso));
  const mon = new Intl.DateTimeFormat("en-GB", { timeZone, month: "short" }).format(new Date(iso)).toUpperCase();
  return `${wd} ${d.day} ${mon} ${d.year}`;
}

/** Long style for the details card: "Saturday, 13 February 2027". */
export function formatLongDate(iso: string, timeZone: string, locale: Locale): string {
  if (locale === "my") return formatShortDate(iso, timeZone, locale);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function myPeriod(hour: number): string {
  if (hour < 12) return "နံနက်";
  if (hour < 15) return "နေ့လယ်";
  if (hour < 18) return "ညနေ";
  return "ည";
}

function oneTime(iso: string, timeZone: string, locale: Locale): string {
  const d = zonedParts(iso, timeZone);
  if (locale === "my") {
    const h12 = d.hour % 12 || 12;
    return `${myPeriod(d.hour)} (${toMyanmarDigits(`${h12}:${String(d.minute).padStart(2, "0")}`)}) နာရီ`;
  }
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** "11:30 AM" or "9:00 AM to 11:00 AM"; Burmese like the printed card. */
export function formatTimeRange(startIso: string, endIso: string | null, timeZone: string, locale: Locale): string {
  const start = oneTime(startIso, timeZone, locale);
  if (!endIso) return locale === "my" ? start : `At ${start}`;
  const end = oneTime(endIso, timeZone, locale);
  return locale === "my" ? `${start}မှ ${end}အထိ` : `${start} to ${end}`;
}

export function weddingYear(iso: string, timeZone: string): number {
  return zonedParts(iso, timeZone).year;
}
