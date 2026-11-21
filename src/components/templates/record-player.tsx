"use client";

import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

/** Four little bars that dance while something is playing. */
export function Equalizer({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span aria-hidden data-on={on} className={`tpl-eq inline-flex h-4 items-end gap-[2px] ${className}`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * A vinyl record that spins while the couple's song plays. With no music
 * uploaded it still spins on tap, so the page behaves the same everywhere.
 */
export function RecordPlayer({
  src,
  title,
  monogram,
  locale,
  light = false,
}: {
  src: string | null;
  title: string | null;
  monogram: string;
  locale: Locale;
  /** A pale cream disc with fine navy grooves instead of black vinyl. */
  light?: boolean;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const label = s(playing ? "pauseSong" : "playSong", locale);
  const [a, b] = monogram.split("&");
  const groove = light ? "#2e4378" : "#fff";

  async function toggle() {
    const el = audio.current;
    if (!el) {
      setPlaying((v) => !v);
      return;
    }
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setPlaying(false);
      }
    } else {
      el.pause();
    }
  }

  return (
    <div className="relative mx-auto size-[clamp(11rem,58vw,17rem)]">
      {src && (
        <audio
          ref={audio}
          src={src}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
      <div data-playing={playing} className="tpl-vinyl size-full rounded-full shadow-[0_18px_40px_-14px_rgba(30,45,90,.55)]" style={light ? { boxShadow: "0 14px 34px -16px rgba(46,67,120,.45)" } : undefined}>
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
          <defs>
            <radialGradient id="vinyl-body" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={light ? "#fffdf8" : "#1b1f2b"} />
              <stop offset="1" stopColor={light ? "#e9e1d0" : "#0c0e14"} />
            </radialGradient>
            <linearGradient id="vinyl-shine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.16" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="99" fill="url(#vinyl-body)" />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx="100" cy="100" r={44 + i * 3.8} fill="none" stroke={groove} strokeOpacity={light ? (i % 3 === 0 ? 0.3 : 0.16) : i % 3 === 0 ? 0.11 : 0.05} />
          ))}
          <circle cx="100" cy="100" r="99" fill="url(#vinyl-shine)" />
          {/* the label */}
          <circle cx="100" cy="100" r="36" fill="#dbe6f7" />
          <circle cx="100" cy="100" r="33" fill="none" stroke="#2e4378" strokeOpacity="0.35" />
          <text x="100" y="106" textAnchor="middle" fontSize="19" fill="#2e4378" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {a}
            <tspan fontSize="11" dy="-3"> &amp; </tspan>
            <tspan dy="3">{b}</tspan>
          </text>
          <circle cx="100" cy="100" r="3" fill={light ? "#2e4378" : "#0c0e14"} />
        </svg>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={title ? `${label}: ${title}` : label}
        className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[color:var(--navy)] shadow-lg backdrop-blur transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
      </button>
    </div>
  );
}
