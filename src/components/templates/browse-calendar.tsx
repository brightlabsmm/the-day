"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatNumber, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { EN_DAYS, EN_MONTHS, MY_DAYS, MY_MONTHS } from "./calendar";

/**
 * A month calendar the guest can page through. The wedding day is circled in
 * its own month. `year`, `month` (1–12) and `day` come from the wedding's
 * timezone, worked out on the server.
 */
export function BrowseCalendar({ year, month, day, locale }: { year: number; month: number; day: number; locale: Locale }) {
  const [offset, setOffset] = useState(0);
  const idx = year * 12 + (month - 1) + offset;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const startPad = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // Sunday first
  const cells: (number | null)[] = [...Array.from({ length: startPad }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = locale === "my" ? MY_MONTHS[m - 1] : EN_MONTHS[m - 1];
  // The shared day names start on Monday; this calendar starts on Sunday.
  const names = locale === "my" ? [MY_DAYS[6], ...MY_DAYS.slice(0, 6)] : [EN_DAYS[6], ...EN_DAYS.slice(0, 6)];
  const isWeddingMonth = y === year && m === month;

  const arrow = "grid size-9 place-items-center rounded-full text-[color:var(--navy)] transition hover:bg-[color:var(--gold-soft)]/50";
  return (
    <div lang={locale} className="tpl-card mx-auto w-full max-w-md">
      <div className="flex items-center justify-between">
        <button type="button" className={arrow} onClick={() => setOffset((o) => o - 1)} aria-label={s("prevMonth", locale)}>
          <ChevronLeft className="size-5" />
        </button>
        <p className="tpl-eyebrow !text-[0.85rem] !text-[color:var(--navy)]" aria-live="polite">
          {monthName} {formatNumber(y, locale)}
        </p>
        <button type="button" className={arrow} onClick={() => setOffset((o) => o + 1)} aria-label={s("nextMonth", locale)}>
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div role="grid" aria-label={`${monthName} ${y}`} className="mt-5 grid grid-cols-7 gap-y-2 text-center text-[0.9rem]">
        {names.map((n) => (
          <span key={n} role="columnheader" className="tpl-eyebrow !text-[0.58rem] !tracking-[0.12em]">
            {n}
          </span>
        ))}
        {cells.map((c, i) =>
          c === null ? (
            <span key={`e${i}`} role="gridcell" aria-hidden />
          ) : (
            <span
              key={c}
              role="gridcell"
              aria-current={isWeddingMonth && c === day ? "date" : undefined}
              className={`mx-auto grid size-8 place-items-center rounded-full ${isWeddingMonth && c === day ? "bg-[color:var(--gold)] font-semibold text-white shadow-md" : "text-[color:var(--ink)]"}`}
            >
              {formatNumber(c, locale)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
