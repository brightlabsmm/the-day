"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

/**
 * Dispatched by the opening screen (Gate / Opening) the moment a guest taps
 * "open" or "skip" — a real click, so starting audio in response to it is
 * still within the browser's autoplay-with-sound allowance. Dispatch it
 * synchronously, before any `await`, so the click's user-activation carries
 * through to the listener below.
 */
export const GATE_OPENED_EVENT = "theday:gate-opened";

/**
 * Background music. Starts on its own once the guest opens the invitation
 * (see GATE_OPENED_EVENT above); if the browser still blocks it, or on a
 * repeat visit this session where no new click occurs, the guest can start
 * or pause it anytime with the floating button. Fixed to the bottom-right
 * corner.
 */
export function MusicPlayer({ src, title, locale }: { src: string; title: string | null; locale: Locale }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const tryPlay = () => {
      const el = audio.current;
      if (el?.paused) el.play().catch(() => {});
    };
    window.addEventListener(GATE_OPENED_EVENT, tryPlay);
    return () => window.removeEventListener(GATE_OPENED_EVENT, tryPlay);
  }, []);

  async function toggle() {
    const el = audio.current;
    if (!el) return;
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

  const label = playing ? s("musicPause", locale) : s("musicPlay", locale);

  return (
    <>
      <audio
        ref={audio}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={title ? `${label}: ${title}` : label}
        aria-pressed={playing}
        className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] grid size-11 place-items-center rounded-full border border-navy/40 bg-ivory/90 text-navy shadow-md backdrop-blur"
      >
        {playing ? <Pause className="size-5" aria-hidden /> : <Music className="size-5" aria-hidden />}
      </button>
    </>
  );
}
