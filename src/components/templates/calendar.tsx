import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber } from "@/lib/i18n/numerals";
import { zonedParts } from "@/lib/i18n/datetime";

const MY_MONTHS = ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// Monday first
const MY_DAYS = ["လာ", "ဂါ", "ဟူး", "ကြာ", "သော", "နေ", "နွေ"];
const EN_DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

/** A month grid with the wedding day circled. Display-only. */
export function MonthCalendar({ iso, timeZone, locale }: { iso: string; timeZone: string; locale: Locale }) {
  const d = zonedParts(iso, timeZone);
  const daysInMonth = new Date(Date.UTC(d.year, d.month, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(d.year, d.month - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthName = locale === "my" ? MY_MONTHS[d.month - 1] : EN_MONTHS[d.month - 1];
  const dayNames = locale === "my" ? MY_DAYS : EN_DAYS;

  return (
    <div lang={locale} className="mx-auto w-full max-w-xs text-center">
      <p className="tpl-display text-[1.5rem] text-[color:var(--navy)]">
        {monthName} {formatNumber(d.year, locale)}
      </p>
      <div role="grid" aria-label={`${monthName} ${d.year}`} className="mt-4 grid grid-cols-7 gap-y-1 text-[0.85rem]">
        {dayNames.map((n) => (
          <span key={n} role="columnheader" className="tpl-eyebrow !text-[0.6rem] !tracking-[0.12em]">
            {n}
          </span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e${i}`} role="gridcell" aria-hidden />
          ) : (
            <span
              key={day}
              role="gridcell"
              aria-current={day === d.day ? "date" : undefined}
              className={`mx-auto grid size-8 place-items-center rounded-full ${
                day === d.day ? "bg-[color:var(--gold)] font-semibold text-white" : "text-[color:var(--ink)]"
              }`}
            >
              {formatNumber(day, locale)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
