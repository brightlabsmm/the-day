"use client";

import { useRef, useState } from "react";
import { Music, Pause } from "lucide-react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

/**
 * Optional background music. Never autoplays: guests choose to start it, and
 * it stays paused otherwise. Fixed to the bottom-right corner.
 */
export function MusicPlayer({ src, title, locale }: { src: string; title: string | null; locale: Locale }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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
