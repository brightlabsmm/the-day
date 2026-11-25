"use client";

/*
 * The Lotus Sanctuary Opening Cover:
 * Night theme inspired by the Sunrise gate design, featuring:
 * - Nocturnal starlit sky with twinkling stars
 * - A glowing celestial moon ascending above the horizon
 * - Layered deep lake waves with a shimmering moonbeam reflection path
 * - Floating blooming sacred lotuses and lily pads resting on the water
 * - Cormorant/Cinzel typography with tap prompt and top-right skip button
 */
import { useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Locale } from "@/lib/i18n/numerals";
import { gs } from "@/lib/i18n/gift-strings";

export type SanctuaryCoverProps = {
  locale: Locale;
  title: string;
  subtitle?: string;
  opening: boolean;
  onOpen: (origin?: { x: number; y: number }) => void;
  onSkip: () => void;
  onAnimationComplete?: () => void;
};

type Star = {
  x: number;
  y: number;
  s: number;
  dur: number;
  delay: number;
  bright?: boolean;
};

const STARS: Star[] = [
  // ── A few slightly brighter pinpoint stars ──
  { x: 18, y: 14, s: 2.2, dur: 3.4, delay: 0.2, bright: true },
  { x: 52, y: 5, s: 2.3, dur: 4.2, delay: 1.1, bright: true },
  { x: 82, y: 12, s: 2.2, dur: 3.6, delay: 0.6, bright: true },
  { x: 9, y: 36, s: 2.0, dur: 4.0, delay: 1.8, bright: true },
  { x: 91, y: 26, s: 2.1, dur: 3.2, delay: 0.9, bright: true },
  { x: 34, y: 16, s: 2.0, dur: 3.8, delay: 1.4, bright: true },
  { x: 69, y: 27, s: 2.0, dur: 2.7, delay: 1.7, bright: true },
  { x: 41, y: 12, s: 2.1, dur: 3.5, delay: 0.7, bright: true },

  // ── Natural delicate night stars ──
  { x: 6, y: 18, s: 1.7, dur: 2.9, delay: 0.4 },
  { x: 27, y: 9, s: 1.5, dur: 3.1, delay: 1.3 },
  { x: 63, y: 8, s: 1.6, dur: 3.3, delay: 1.0 },
  { x: 74, y: 19, s: 1.6, dur: 2.8, delay: 0.3 },
  { x: 95, y: 15, s: 1.7, dur: 3.7, delay: 1.6 },
  { x: 15, y: 48, s: 1.8, dur: 3.0, delay: 0.8 },
  { x: 24, y: 28, s: 1.6, dur: 3.9, delay: 1.5 },
  { x: 79, y: 34, s: 1.6, dur: 3.2, delay: 0.5 },
  { x: 87, y: 44, s: 1.7, dur: 3.6, delay: 1.2 },
  { x: 47, y: 19, s: 1.5, dur: 4.1, delay: 0.1 },

  // ── Delicate background pinpoints ──
  { x: 4, y: 8, s: 1.2, dur: 2.6, delay: 0.3 },
  { x: 12, y: 22, s: 1.3, dur: 3.4, delay: 1.2 },
  { x: 21, y: 38, s: 1.2, dur: 2.8, delay: 0.7 },
  { x: 30, y: 24, s: 1.4, dur: 3.6, delay: 1.9 },
  { x: 38, y: 7, s: 1.1, dur: 3.0, delay: 0.5 },
  { x: 46, y: 23, s: 1.3, dur: 2.5, delay: 1.4 },
  { x: 58, y: 14, s: 1.4, dur: 3.8, delay: 0.8 },
  { x: 66, y: 21, s: 1.2, dur: 3.1, delay: 1.5 },
  { x: 72, y: 11, s: 1.3, dur: 2.9, delay: 0.2 },
  { x: 85, y: 7, s: 1.2, dur: 3.5, delay: 1.1 },
  { x: 93, y: 38, s: 1.3, dur: 2.7, delay: 0.6 },
  { x: 3, y: 29, s: 1.1, dur: 3.3, delay: 1.7 },
  { x: 8, y: 52, s: 1.4, dur: 2.9, delay: 0.4 },
  { x: 17, y: 56, s: 1.2, dur: 3.7, delay: 1.0 },
  { x: 26, y: 44, s: 1.3, dur: 3.2, delay: 0.9 },
  { x: 76, y: 42, s: 1.3, dur: 2.8, delay: 1.3 },
  { x: 83, y: 51, s: 1.4, dur: 3.4, delay: 0.2 },
  { x: 92, y: 54, s: 1.2, dur: 3.6, delay: 1.6 },
  { x: 97, y: 22, s: 1.1, dur: 2.7, delay: 0.8 },
  { x: 56, y: 22, s: 1.3, dur: 3.9, delay: 1.2 },
  { x: 61, y: 30, s: 1.3, dur: 3.3, delay: 0.5 },
  { x: 39, y: 29, s: 1.2, dur: 2.6, delay: 1.8 },
  { x: 89, y: 18, s: 1.3, dur: 3.5, delay: 0.7 },
  { x: 14, y: 7, s: 1.2, dur: 3.1, delay: 1.4 },
];

export function SanctuaryCover({
  locale,
  title,
  subtitle,
  opening,
  onOpen,
  onSkip,
  onAnimationComplete,
}: SanctuaryCoverProps) {
  const reduceMotion = useReducedMotion();

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      if (opening) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.top + rect.height / 2;
      onOpen({ x, y });
    },
    [onOpen, opening],
  );

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={gs("coverEyebrow", locale)}
      lang={locale}
      onClick={handleOpen}
      className="fixed inset-0 z-40 grid h-full w-full cursor-pointer place-items-center overflow-hidden select-none"
      style={{
        background: "linear-gradient(180deg, #030712 0%, #061427 40%, #0d223d 72%, #163456 100%)",
      }}
      animate={{
        opacity: opening ? 0 : 1,
      }}
      transition={{
        duration: 0.8,
        delay: opening && !reduceMotion ? 1.1 : 0,
        ease: "easeOut",
      }}
      onAnimationComplete={() => {
        if (opening) onAnimationComplete?.();
      }}
    >
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes lotusFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .star-twinkle, .lotus-float { animation: none !important; }
        }
      `}</style>

      {/* Twinkling stars across the night sky */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((st, i) => (
          <span
            key={i}
            className="star-twinkle absolute rounded-full bg-[#fffbee]"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.s}px`,
              height: `${st.s}px`,
              animation: `starTwinkle ${st.dur}s ${st.delay}s ease-in-out infinite`,
              boxShadow: st.bright
                ? "0 0 5px 1.5px rgba(255, 252, 235, 0.8), 0 0 9px 2.5px rgba(248, 226, 162, 0.4)"
                : "0 0 2px 0.5px rgba(255, 251, 238, 0.45)",
            }}
          />
        ))}
      </div>

      {/* Skip button in top right (matching Sunrise gate pill) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        aria-label={gs("skip", locale)}
        className="absolute top-[max(1.2rem,env(safe-area-inset-top))] right-4 z-30 rounded-full bg-black/60 px-4 py-2 text-[0.65rem] tracking-[0.2em] text-white uppercase backdrop-blur transition hover:bg-black/80 [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case"
      >
        {gs("skip", locale)}
      </button>

      {/* Glowing Celestial Moon rising over the lake horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[26%] left-1/2 size-48 rounded-full shadow-[0_0_80px_28px_rgba(248,226,162,0.45),0_0_150px_60px_rgba(229,193,108,0.18)] md:size-56"
        style={{
          background: "radial-gradient(circle at 38% 34%, #fffdf4 0%, #faedd0 42%, #e5c586 75%, #b28e46 100%)",
          transform: `translate(-50%, ${opening && !reduceMotion ? "-150%" : "32%"})`,
          transition: "transform 1.6s cubic-bezier(0.35, 0, 0.2, 1)",
        }}
      >
        {/* Soft lunar craters texture */}
        <span
          className="block size-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 66% 60%, rgba(160, 125, 55, 0.22) 0 14%, transparent 15%), radial-gradient(circle at 34% 68%, rgba(160, 125, 55, 0.18) 0 11%, transparent 12%)",
          }}
        />
      </div>

      {/* Lake Waves, Moonlit Reflection, and Floating Lotus Flowers */}
      <svg
        aria-hidden
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full"
      >
        <defs>
          {/* Moonbeam water reflection sheen gradient */}
          <linearGradient id="lake-moonbeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8e2a2" stopOpacity="0.38" />
            <stop offset="45%" stopColor="#e5c16c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#040d18" stopOpacity="0" />
          </linearGradient>

          {/* Lotus petal gradient */}
          <linearGradient id="lotus-petal-pink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde8ef" />
            <stop offset="55%" stopColor="#f48fb1" />
            <stop offset="100%" stopColor="#c2185b" />
          </linearGradient>
          <linearGradient id="lotus-petal-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffdf0" />
            <stop offset="100%" stopColor="#f8bbd0" />
          </linearGradient>

          {/* Lily pad gradient */}
          <radialGradient id="lotus-lily-pad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#134e4a" />
            <stop offset="70%" stopColor="#042f2e" />
            <stop offset="100%" stopColor="#021c1b" />
          </radialGradient>
        </defs>

        {/* Moonbeam shimmer on water */}
        <path d="M 185 0 L 215 0 L 245 220 L 155 220 Z" fill="url(#lake-moonbeam)" opacity="0.75" />

        {/* Distant water wave */}
        <path
          d="M 0 50 C 70 30, 130 65, 200 45 C 270 25, 340 55, 400 40 V 220 H 0 Z"
          fill="#122a46"
        />
        <path
          d="M 0 50 C 70 30, 130 65, 200 45 C 270 25, 340 55, 400 40"
          fill="none"
          stroke="rgba(248,226,162,0.3)"
          strokeWidth="0.8"
        />

        {/* Mid lake wave with moonlit crest */}
        <path
          d="M 0 95 C 80 75, 150 110, 225 85 C 300 65, 360 100, 400 90 V 220 H 0 Z"
          fill="#0a1d33"
        />
        <path
          d="M 0 95 C 80 75, 150 110, 225 85 C 300 65, 360 100, 400 90"
          fill="none"
          stroke="rgba(248,226,162,0.35)"
          strokeWidth="0.9"
        />

        {/* Foreground calm deep lake water */}
        <path
          d="M 0 145 C 90 130, 170 160, 245 140 C 320 120, 370 145, 400 138 V 220 H 0 Z"
          fill="#040d18"
        />
        <path
          d="M 0 145 C 90 130, 170 160, 245 140 C 320 120, 370 145, 400 138"
          fill="none"
          stroke="rgba(248,226,162,0.4)"
          strokeWidth="1.1"
        />

        {/* Water ripple accents */}
        <path d="M 160 165 C 185 162, 215 162, 240 165" stroke="rgba(248,226,162,0.5)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 175 180 C 195 178, 205 178, 225 180" stroke="rgba(248,226,162,0.4)" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 182 195 C 196 193, 204 193, 218 195" stroke="rgba(248,226,162,0.3)" strokeWidth="0.8" strokeLinecap="round" fill="none" />

        {/* Left Floating Sacred Lotus (Foreground Center-Left) */}
        <g transform="translate(112, 138)" className="lotus-float" style={{ animation: "lotusBob 4s ease-in-out infinite" }}>
          <ellipse cx="0" cy="18" rx="42" ry="14" fill="url(#lotus-lily-pad)" stroke="#2dd4bf" strokeWidth="0.6" strokeOpacity="0.45" />
          <path d="M 0 18 L 38 14" stroke="#0f766e" strokeWidth="0.6" strokeOpacity="0.7" />

          {/* Outer petals */}
          <path d="M 0 16 C -25 12, -38 0, -28 -12 C -20 -15, -12 2, 0 14 Z" fill="url(#lotus-petal-pink)" stroke="#f8e2a2" strokeWidth="0.6" />
          <path d="M 0 16 C 25 12, 38 0, 28 -12 C 20 -15, 12 2, 0 14 Z" fill="url(#lotus-petal-pink)" stroke="#f8e2a2" strokeWidth="0.6" />
          <path d="M 0 16 C -18 8, -26 -8, -14 -22 C -6 -18, -4 -2, 0 14 Z" fill="url(#lotus-petal-pink)" stroke="#fff0f5" strokeWidth="0.6" />
          <path d="M 0 16 C 18 8, 26 -8, 14 -22 C 6 -18, 4 -2, 0 14 Z" fill="url(#lotus-petal-pink)" stroke="#fff0f5" strokeWidth="0.6" />

          {/* Center inner blooming petals */}
          <path d="M 0 15 C -8 4, -12 -14, 0 -28 C 12 -14, 8 4, 0 15 Z" fill="url(#lotus-petal-inner)" stroke="#f8e2a2" strokeWidth="0.8" />
          <circle cx="0" cy="-2" r="3.5" fill="#fde047" filter="drop-shadow(0 0 5px #fef08a)" />
        </g>

        {/* Right Floating Small Lotus (Midground Right) */}
        <g transform="translate(295, 102) scale(0.65)" className="lotus-float" style={{ animation: "lotusBob 4.6s 1.2s ease-in-out infinite" }}>
          <ellipse cx="0" cy="16" rx="34" ry="11" fill="url(#lotus-lily-pad)" stroke="#2dd4bf" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 0 14 C -20 10, -28 0, -20 -10 C -14 -12, -8 2, 0 12 Z" fill="url(#lotus-petal-pink)" stroke="#f8e2a2" strokeWidth="0.5" />
          <path d="M 0 14 C 20 10, 28 0, 20 -10 C 14 -12, 8 2, 0 12 Z" fill="url(#lotus-petal-pink)" stroke="#f8e2a2" strokeWidth="0.5" />
          <path d="M 0 13 C -6 3, -9 -10, 0 -22 C 9 -10, 6 3, 0 13 Z" fill="url(#lotus-petal-inner)" stroke="#f8e2a2" strokeWidth="0.7" />
          <circle cx="0" cy="-1" r="2.8" fill="#fde047" />
        </g>
      </svg>

      {/* Main text & prompt (centered over upper sky) */}
      <div
        className="relative z-10 -mt-20 flex flex-col items-center px-6 text-center"
        style={{
          opacity: opening ? 0 : 1,
          transition: "opacity 0.6s ease-out",
        }}
      >
        {/* Title: 2 stacked uppercase lines like SU MON / LIN HTET */}
        <p
          className="text-[clamp(2.1rem,7.5vw,3.6rem)] leading-[1.12] tracking-[0.08em] uppercase text-[#f8e2a2] drop-shadow-[0_2px_14px_rgba(229,193,108,0.35)] [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-[clamp(1.7rem,6vw,2.6rem)]"
          style={{ fontFamily: locale === "my" ? "var(--font-myanmar)" : "var(--font-cormorant), serif" }}
        >
          {locale === "my" ? (
            title || "ကြာပန်းဥယျာဉ်"
          ) : (
            <>
              THE LOTUS
              <span className="block">SANCTUARY</span>
            </>
          )}
        </p>

        {/* Italic connecting phrase */}
        <p
          className="my-1.5 text-[1.1rem] italic text-[#e5c16c] md:text-[1.25rem] [&:lang(my)]:text-[0.95rem] [&:lang(my)]:not-italic"
          style={{ fontFamily: locale === "my" ? "var(--font-myanmar)" : "var(--font-cormorant), serif" }}
        >
          {locale === "my" ? "မိတ်ဆက် ဆုမင်္ဂလာ ၁၂ ပါး" : "12 Sacred Launch Blessings"}
        </p>

        {/* Subtitle / Author */}
        <p className="text-[0.75rem] tracking-[0.28em] uppercase text-[#f3dca0]/85 md:text-[0.82rem] [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-[0.85rem]">
          {locale === "my" ? (subtitle || "ဆရာမ Elena ၏ မိတ်ဆက်ပွဲ") : "by Master Elena"}
        </p>

        {/* Tap Prompt (matching TAP TO GREET THE DAY) */}
        <p className="mt-8 text-[0.72rem] tracking-[0.3em] uppercase text-[#e5c16c] animate-pulse md:text-[0.78rem] [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-[0.85rem]">
          {gs("coverEnter", locale)}
        </p>
      </div>
    </motion.div>
  );
}
