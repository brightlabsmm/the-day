/*
 * Static pieces of the sleeve-and-card opening scene, after the printed
 * invitation: a card with a gold cord, tucked into a paper sleeve that has a
 * semicircle thumb notch. Server-safe (no client hooks).
 */
import type { ReactNode } from "react";
import { DoubleRule, MonogramSeal } from "@/components/ornaments";

/** Gold cord looped through the card's punched hole. */
export function GoldCord({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 46" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="cord" x1="0" x2="1">
          <stop offset="0" stopColor="#7f6129" />
          <stop offset=".45" stopColor="#d9c49a" />
          <stop offset="1" stopColor="#8a6a2f" />
        </linearGradient>
      </defs>
      {/* loop above the card */}
      <path d="M30 40 C 14 30, 12 8, 30 4 C 48 8, 46 30, 30 40" stroke="url(#cord)" strokeWidth="3" />
      {/* twist highlights */}
      <path
        d="M30 40 C 14 30, 12 8, 30 4 C 48 8, 46 30, 30 40"
        stroke="#f3e6c4"
        strokeOpacity=".55"
        strokeWidth="1"
        strokeDasharray="1.6 3.2"
      />
      {/* punched hole */}
      <circle cx="30" cy="40" r="4.2" fill="#d8c8ac" stroke="#b9a37c" strokeWidth=".8" />
      <circle cx="30" cy="40" r="2.2" fill="#a8823f" />
    </svg>
  );
}

/** The top of the invitation card that peeks out of the sleeve. */
export function CardFace({
  monogram,
  title,
  names,
}: {
  monogram: string;
  title: string;
  /** Revealed as the card slides out of the sleeve. */
  names?: { one: string; two: string; and: string; lang: string };
}) {
  return (
    <div className="paper frame-double relative h-full w-full px-5 pt-7 text-navy">
      <GoldCord className="absolute -top-[30px] left-1/2 h-[46px] w-[60px] -translate-x-1/2" />
      <div className="flex flex-col items-center">
        <MonogramSeal monogram={monogram} className="size-[52px] text-[1.35rem]" />
        <DoubleRule className="mt-3 w-full" />
        <p className="foil font-display my-1.5 text-center text-[clamp(1.2rem,6.4vw,1.75rem)] leading-none font-bold tracking-[0.02em] whitespace-nowrap">
          {title}
        </p>
        <DoubleRule className="w-full" />
        {names && (
          <div lang={names.lang} className="mt-[14%] w-full text-center">
            <p className="foil font-display text-[2rem] leading-tight font-semibold [&:lang(my)]:text-[1.6rem]">
              {names.one}
            </p>
            <div className="my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-navy/50" />
              <span className="font-display text-lg text-gold italic [&:lang(my)]:not-italic [&:lang(my)]:text-sm">
                {names.and}
              </span>
              <span className="h-px flex-1 bg-navy/50" />
            </div>
            <p className="foil font-display text-[2rem] leading-tight font-semibold [&:lang(my)]:text-[1.6rem]">
              {names.two}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** The sleeve front. Its thumb notch is cut with a CSS mask. */
export function SleeveFront({ children }: { children?: ReactNode }) {
  return (
    <div className="h-full w-full drop-shadow-[0_-2px_3px_rgba(74,52,38,.22)]">
      <div
        className="paper relative flex h-full w-full flex-col items-center bg-paper px-6 pt-14 pb-7 text-center [mask-image:radial-gradient(circle_at_50%_0,transparent_29px,#000_30px)]"
        style={{ backgroundColor: "var(--paper)" }}
      >
        {/* hairline that follows the notch, like a die-cut edge */}
        <span
          aria-hidden
          className="absolute -top-[31px] left-1/2 size-[62px] -translate-x-1/2 rounded-full border border-ink/15"
        />
        <span aria-hidden className="absolute inset-x-4 top-3 h-px bg-navy/25" />
        {children}
      </div>
    </div>
  );
}

/** Fixed-size stage holding the card behind the sleeve. */
export const STAGE = {
  width: "min(84vw, 340px)",
  /** card is 0.83 as wide as tall, like the printed card */
  cardAspect: "83 / 100",
  /** how far the card sits out of the sleeve when sealed */
  peek: 0.42,
  /** stage = card height + peek */
  stageAspect: "83 / 142",
};

/** Shown while the guest's invitation streams in: same sleeve, no names yet. */
export function SleeveShell() {
  return (
    <div className="grid min-h-svh place-items-center overflow-hidden bg-paper-deep px-4">
      <div className="relative" style={{ width: STAGE.width, aspectRatio: STAGE.stageAspect }}>
        <div className="absolute inset-x-0 top-0" style={{ aspectRatio: STAGE.cardAspect }}>
          <div className="paper frame-double h-full w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0" style={{ aspectRatio: STAGE.cardAspect }}>
          <SleeveFront>
            <span className="mt-6 h-3 w-28 animate-pulse bg-ink/10" />
            <span className="mt-3 h-5 w-40 animate-pulse bg-ink/10" />
          </SleeveFront>
        </div>
      </div>
    </div>
  );
}
