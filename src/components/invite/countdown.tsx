"use client";

import { useSyncExternalStore } from "react";
import { countdown } from "@/lib/countdown";
import { formatNumber, type Locale } from "@/lib/i18n/numerals";
import { s, type StringKey } from "@/lib/i18n/strings";
import { DoubleRule, Flourish } from "@/components/ornaments";

/* A shared one-second clock. The server snapshot is null so nothing
   time-dependent is rendered on the server (no hydration mismatch). */
function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const nowSecond = () => Math.floor(Date.now() / 1000);
const serverNow = () => null;

const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies readonly StringKey[];

export function Countdown({
  targetIso,
  locale,
  label,
}: {
  targetIso: string;
  locale: Locale;
  /** Accessible description of what is being counted down to, e.g. the date. */
  label: string;
}) {
  const now = useSyncExternalStore(subscribe, nowSecond, serverNow);
  const state = now === null ? null : countdown(Date.parse(targetIso), now * 1000);
  const before = state?.phase === "before" ? state : null;
  const finished = state && state.phase !== "before" ? state.phase : null;
  const counting = !finished;

  return (
    <section
      aria-labelledby="countdown-heading"
      lang={locale}
      className="paper frame-double mt-8 px-[clamp(0.75rem,4vw,1.5rem)] py-6 text-center text-navy"
    >
      <DoubleRule />
      {counting ? (
        <h2 id="countdown-heading" className="countdown-heading mt-5">
          {s("countdownHeading", locale)}
        </h2>
      ) : (
        <h2 id="countdown-heading" className="card-gold-name foil mt-6 mb-6 px-2">
          {s(finished === "today" ? "countdownToday" : "countdownAfter", locale)}
        </h2>
      )}
      <p className="sr-only">{label}</p>

      {counting && (
        // The digits tick every second, so they are hidden from screen readers;
        // the date in the label above carries the same information.
        <div aria-hidden className="mt-4 mb-5 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start">
          {UNITS.map((unit, i) => (
            <Unit
              key={unit}
              value={before ? formatNumber(before[unit], locale, unit === "days" ? 0 : 2) : "––"}
              label={s(unit, locale)}
              divider={i < UNITS.length - 1}
            />
          ))}
        </div>
      )}

      <Flourish className="mx-auto text-gold" />
      <DoubleRule className="mt-5" />
    </section>
  );
}

function Unit({ value, label, divider }: { value: string; label: string; divider: boolean }) {
  return (
    <>
      <div className="flex flex-col items-center">
        <span className="countdown-number">{value}</span>
        <span className="countdown-label mt-1">{label}</span>
      </div>
      {divider && <span aria-hidden className="mt-3 h-8 w-px bg-navy/40" />}
    </>
  );
}
