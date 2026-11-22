"use client";

/*
 * The three ways to pick a gift, as in the original design: twelve lotus
 * petals on a pond, twelve stars on an astrolabe, or a table of oracle cards.
 * Each is a set of real buttons, so they work with a keyboard and screen readers.
 */
import { useState, type CSSProperties } from "react";
import type { GiftItem } from "@/lib/gift";
import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber, t } from "@/lib/i18n/numerals";
import { gs } from "@/lib/i18n/gift-strings";
import { GiftIconView, LockedStar } from "./icons";

type ViewProps = {
  items: GiftItem[];
  unlocked: ReadonlySet<number>;
  locale: Locale;
  onOpen: (position: number) => void;
};

const label = (item: GiftItem, open: boolean, locale: Locale) =>
  `${gs("blessing", locale)} ${formatNumber(item.position, locale)}${open ? ` · ${t(item.title, locale)}` : ""}`;

/** Twelve petals in a ring around the sacred core, with ripples spreading on the pond. */
export function LotusView({ items, unlocked, locale, onOpen, onCore }: ViewProps & { onCore: () => void }) {
  const left = items.length - unlocked.size;
  const done = items.length > 0 && left === 0;
  const [hot, setHot] = useState<number | null>(null);
  return (
    <div className="gift-stage relative aspect-square w-[min(92vw,31rem)]">
      <div aria-hidden className="gift-ripples absolute inset-[16%]">
        <span />
        <span />
        <span />
      </div>
      <svg aria-hidden viewBox="0 0 400 400" className="gift-spin-slow pointer-events-none absolute inset-0 size-full opacity-40">
        <g fill="none" stroke="#e5c16c">
          <circle cx="200" cy="200" r="185" strokeWidth=".7" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="152" strokeWidth=".5" />
          <polygon points="200,18 358,290 42,290" strokeWidth=".5" />
          <polygon points="200,382 358,110 42,110" strokeWidth=".5" />
        </g>
      </svg>

      {/*
        The petals weave into one closed ring: each petal's right half lies
        under the next petal's left half, and 12 passes under 1. Plain stacking
        cannot do that, so each petal is drawn in three layers: all right halves
        (the real buttons), all left halves on top of them, then the numbers and
        icons above both. Hovering either half lifts the whole petal.
      */}
      <PetalLayer items={items} unlocked={unlocked} locale={locale} onOpen={onOpen} hot={hot} setHot={setHot} half="right" />
      <PetalLayer items={items} unlocked={unlocked} locale={locale} onOpen={onOpen} hot={hot} setHot={setHot} half="left" />
      <PetalLayer items={items} unlocked={unlocked} locale={locale} onOpen={onOpen} hot={hot} setHot={setHot} half="face" />

      <button
        type="button"
        onClick={onCore}
        className="gift-core absolute top-1/2 left-1/2 z-10 grid size-[23%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center"
      >
        <span aria-hidden className="gift-core-aura absolute inset-1 rounded-full" />
        <span className="relative flex flex-col items-center">
          <GiftIconView icon={done ? "crown" : "lotus"} className="size-[clamp(1.4rem,5.6vw,2rem)]" />
          <span className="gift-caps mt-1 text-[clamp(0.45rem,1.8vw,0.62rem)] text-[#f8e2a2]">{gs("core", locale)}</span>
          <span className="text-[clamp(0.45rem,1.7vw,0.6rem)] text-[#f3dca0]/75">
            {done ? gs("coreDone", locale) : gs("coreLeft", locale, { n: formatNumber(left, locale) })}
          </span>
        </span>
      </button>
    </div>
  );
}

/** One layer of the woven petal ring (see LotusView): right halves, left halves, or the numbers and icons. */
function PetalLayer({
  items,
  unlocked,
  locale,
  onOpen,
  hot,
  setHot,
  half,
}: ViewProps & { hot: number | null; setHot: (position: number | null) => void; half: "right" | "left" | "face" }) {
  return (
    <ul aria-hidden={half !== "right" || undefined} className={`absolute inset-0 ${half === "face" ? "pointer-events-none" : ""}`}>
      {items.map((item, i) => {
        const open = unlocked.has(item.position);
        const state = { "data-open": open, "data-hot": hot === item.position };
        return (
          <li key={item.position} className="gift-petal" style={{ "--a": `${(360 / items.length) * i}deg` } as CSSProperties}>
            {half === "face" ? (
              <div className="gift-petal-shape gift-petal-face" {...state}>
                <span className="gift-num">{formatNumber(item.position, locale)}</span>
                {open ? <GiftIconView icon={item.icon} className="mt-1 size-[1.15rem]" /> : <LockedStar className="mt-1 size-3.5" />}
              </div>
            ) : (
              <button
                type="button"
                tabIndex={half === "right" ? undefined : -1}
                onClick={() => onOpen(item.position)}
                onMouseEnter={() => setHot(item.position)}
                onMouseLeave={() => setHot(null)}
                onFocus={half === "right" ? () => setHot(item.position) : undefined}
                onBlur={half === "right" ? () => setHot(null) : undefined}
                aria-label={half === "right" ? label(item, open, locale) : undefined}
                className="gift-petal-shape"
                data-half={half}
                {...state}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Twelve stars on a slowly turning golden astrolabe, with a sun at its centre. */
export function AstrolabeView({ items, unlocked, locale, onOpen, onCore }: ViewProps & { onCore: () => void }) {
  return (
    <div className="gift-stage relative aspect-square w-[min(92vw,30rem)]">
      <svg aria-hidden viewBox="0 0 400 400" className="gift-spin-slow pointer-events-none absolute inset-0 size-full">
        <g fill="none">
          <circle cx="200" cy="200" r="188" stroke="rgba(229,193,108,.45)" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="165" stroke="rgba(229,193,108,.25)" strokeDasharray="3 5" />
          <circle cx="200" cy="200" r="115" stroke="rgba(229,193,108,.4)" />
          <rect x="118" y="118" width="164" height="164" stroke="rgba(229,193,108,.25)" strokeWidth=".8" />
          <rect x="118" y="118" width="164" height="164" stroke="rgba(229,193,108,.25)" strokeWidth=".8" transform="rotate(45 200 200)" />
        </g>
      </svg>
      <svg aria-hidden viewBox="0 0 400 400" className="gift-spin-reverse pointer-events-none absolute inset-[12%] size-[76%] opacity-60">
        <g fill="none" stroke="rgba(229,193,108,.35)" strokeWidth=".7">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            return <line key={i} x1={(200 + Math.cos(a) * 150).toFixed(1)} y1={(200 + Math.sin(a) * 150).toFixed(1)} x2={(200 + Math.cos(a) * (i % 2 ? 160 : 172)).toFixed(1)} y2={(200 + Math.sin(a) * (i % 2 ? 160 : 172)).toFixed(1)} />;
          })}
        </g>
      </svg>

      <ul className="absolute inset-0">
        {items.map((item, i) => {
          const open = unlocked.has(item.position);
          const a = ((360 / items.length) * i - 90) * (Math.PI / 180);
          return (
            <li key={item.position} className="absolute" style={{ left: `${50 + Math.cos(a) * 41}%`, top: `${50 + Math.sin(a) * 41}%` }}>
              <button type="button" onClick={() => onOpen(item.position)} data-open={open} aria-label={label(item, open, locale)} className="gift-star">
                <span className="gift-num">{formatNumber(item.position, locale)}</span>
                {open ? <GiftIconView icon={item.icon} className="size-3.5" /> : <LockedStar hollow className="size-3.5" />}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onCore}
        className="gift-sun absolute top-1/2 left-1/2 z-10 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center"
      >
        <span className="flex flex-col items-center">
          <GiftIconView icon="sun" className="size-[clamp(1.3rem,5.4vw,1.9rem)]" />
          <span className="gift-caps mt-1 text-[clamp(0.45rem,1.8vw,0.62rem)] text-[#f8e2a2]">{gs("solstice", locale)}</span>
          <span className="text-[clamp(0.45rem,1.7vw,0.6rem)] text-[#f3dca0]/75">{gs("coreOpen", locale)}</span>
        </span>
      </button>
    </div>
  );
}

/** A table of oracle cards. An unlocked card turns over to show its gift and code. */
export function TarotView({ items, unlocked, locale, onOpen }: ViewProps) {
  return (
    <ul className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-3 px-2 min-[480px]:grid-cols-4 sm:grid-cols-6 sm:gap-4">
      {items.map((item) => {
        const open = unlocked.has(item.position);
        return (
          <li key={item.position} className="gift-card-wrap">
            <button type="button" onClick={() => onOpen(item.position)} aria-label={label(item, open, locale)} className="gift-card" data-open={open}>
              <span className="gift-card-inner">
                <span className="gift-card-face gift-card-back" aria-hidden>
                  <span className="gift-num">{formatNumber(item.position, locale)}</span>
                  <span className="gift-card-sigil">
                    <GiftIconView icon="crystal" className="size-6" />
                  </span>
                  <span className="gift-card-note">{gs("reveal", locale)}</span>
                </span>
                <span className="gift-card-face gift-card-front" aria-hidden>
                  <span className="gift-num">{formatNumber(item.position, locale)}</span>
                  <span className="gift-card-sigil">
                    <GiftIconView icon={item.icon} className="size-5" />
                  </span>
                  <span className="gift-card-note">{locale === "my" ? t(item.category, locale) || item.code : (item.code ?? t(item.category, locale))}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
