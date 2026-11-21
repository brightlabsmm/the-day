"use client";

import { useSyncExternalStore } from "react";
import { countdown } from "@/lib/countdown";
import { formatNumber, type Locale } from "@/lib/i18n/numerals";
import { s, type StringKey } from "@/lib/i18n/strings";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const nowSecond = () => Math.floor(Date.now() / 1000);
const serverNow = () => null;
const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies readonly StringKey[];

/** Big numerals only; the page design supplies the background and heading. */
export function PlainCountdown({
  targetIso,
  locale,
  label,
  variant = "plain",
}: {
  targetIso: string;
  locale: Locale;
  /** "cards" shows each number on a framed flip card; "compact" is small, with dividers; "boxed" is a hairline-bordered strip. */
  variant?: "plain" | "cards" | "compact" | "boxed";
  /** Accessible description of the date being counted down to. */
  label: string;
}) {
  const now = useSyncExternalStore(subscribe, nowSecond, serverNow);
  const state = now === null ? null : countdown(Date.parse(targetIso), now * 1000);
  const before = state?.phase === "before" ? state : null;

  if (state && state.phase !== "before") {
    return (
      <p className="tpl-display text-center text-[clamp(1.4rem,4vw,2.4rem)]">
        {s(state.phase === "today" ? "countdownToday" : "countdownAfter", locale)}
      </p>
    );
  }

  if (variant === "cards") {
    return (
      <div>
        <p className="sr-only">{label}</p>
        <div aria-hidden className="mx-auto flex max-w-xl justify-center gap-[clamp(0.5rem,2.5vw,1.4rem)]">
          {UNITS.map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="relative grid min-w-[3.6rem] place-items-center rounded-lg border-2 border-[color:var(--gold)] bg-gradient-to-b from-white/90 to-[#e4ddd0] px-3 py-3 shadow-[0_6px_14px_-8px_rgba(94,26,39,.5)] sm:min-w-[5.4rem] sm:py-5">
                <span className="absolute top-1/2 -left-[5px] size-2 -translate-y-1/2 rounded-full bg-[color:var(--gold)]" />
                <span className="absolute top-1/2 -right-[5px] size-2 -translate-y-1/2 rounded-full bg-[color:var(--gold)]" />
                <span className="tpl-display text-[clamp(1.6rem,7vw,3rem)] leading-none font-bold text-[color:var(--navy)] tabular-nums">
                  {before ? formatNumber(before[unit], locale, unit === "days" ? 0 : 2) : "––"}
                </span>
              </span>
              <span className="tpl-eyebrow mt-3 !text-[0.6rem]">· {s(unit, locale)} ·</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "boxed") {
    return (
      <div>
        <p className="sr-only">{label}</p>
        <div aria-hidden className="mx-auto grid max-w-lg grid-cols-4 overflow-hidden rounded-lg border border-[color:var(--navy)]/20 bg-[color:var(--paper)]/60">
          {UNITS.map((unit, i) => (
            <div key={unit} className={`flex flex-col items-center py-5 ${i > 0 ? "border-l border-[color:var(--navy)]/20" : ""}`}>
              <span className="tpl-display text-[clamp(1.8rem,7vw,2.8rem)] leading-none tabular-nums">
                {before ? formatNumber(before[unit], locale, unit === "days" ? 0 : 2) : "––"}
              </span>
              <span className="tpl-eyebrow mt-2 !text-[0.58rem]">{s(unit, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div>
        <p className="sr-only">{label}</p>
        <div aria-hidden className="mx-auto flex justify-center">
          {UNITS.map((unit, i) => (
            <div key={unit} className={`flex flex-col items-center px-[0.6rem] ${i > 0 ? "border-l border-[color:var(--navy)]/30" : ""}`}>
              <span className="tpl-display text-[clamp(1.35rem,6vw,1.9rem)] leading-none font-bold tabular-nums">
                {before ? formatNumber(before[unit], locale, unit === "days" ? 0 : 2) : "––"}
              </span>
              <span className="tpl-mono mt-1.5 !text-[0.55rem] !tracking-[0.14em]">{s(unit, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="sr-only">{label}</p>
      <div aria-hidden className="mx-auto flex max-w-3xl items-start justify-center gap-[clamp(0.6rem,3.5vw,2.5rem)]">
        {UNITS.map((unit, i) => (
          <div key={unit} className="flex items-start gap-[clamp(0.6rem,3.5vw,2.5rem)]">
            <div className="flex min-w-[2.4em] flex-col items-center">
              <span className="tpl-display text-[clamp(2.2rem,9vw,5rem)] leading-none tabular-nums">
                {before ? formatNumber(before[unit], locale, unit === "days" ? 0 : 2) : "––"}
              </span>
              <span className="tpl-eyebrow mt-2 !text-current opacity-70">{s(unit, locale)}</span>
            </div>
            {i < UNITS.length - 1 && <span className="tpl-display text-[clamp(1.6rem,6vw,3.4rem)] leading-none opacity-40">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
