"use client";

import { SkipBack, SkipForward } from "lucide-react";
import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

const SKIP_SECONDS = 15;

/**
 * Compact vinyl controls under the envelope hero: previous, a spinning disc
 * that plays or pauses, next, and an "Original Sound" caption.
 */
export function OriginalSound({
  src,
  title,
  locale,
}: {
  src: string | null;
  title: string | null;
  locale: Locale;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const caption = title?.trim() || s("originalSound", locale);
  const playLabel = s(playing ? "musicPause" : "musicPlay", locale);

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

  function seek(delta: number) {
    const el = audio.current;
    if (!el) return;
    const duration = Number.isFinite(el.duration) ? el.duration : 0;
    if (delta < 0) {
      el.currentTime = 0;
      return;
    }
    if (!duration) return;
    el.currentTime = (el.currentTime + delta) % duration;
  }

  return (
    <section aria-label={caption} lang={locale} className="px-6 py-12 text-center sm:py-16">
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
      <div className="mx-auto flex max-w-sm items-center justify-center gap-8 sm:gap-12">
        <button
          type="button"
          onClick={() => seek(-SKIP_SECONDS)}
          aria-label={s("musicPrevious", locale)}
          className="text-[color:var(--navy)] transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)]"
        >
          <SkipBack className="size-9 fill-current sm:size-10" strokeWidth={0} aria-hidden />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={title ? `${playLabel}: ${title}` : playLabel}
          className="grid size-[5.5rem] place-items-center rounded-full text-[color:var(--navy)] transition hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)] sm:size-[6.5rem]"
        >
          <span data-playing={playing} className="tpl-vinyl block size-[4.75rem] sm:size-[5.75rem]">
            <VinylDisc />
          </span>
        </button>
        <button
          type="button"
          onClick={() => seek(SKIP_SECONDS)}
          aria-label={s("musicNext", locale)}
          className="text-[color:var(--navy)] transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)]"
        >
          <SkipForward className="size-9 fill-current sm:size-10" strokeWidth={0} aria-hidden />
        </button>
      </div>
      <p className={`tpl-script mt-5 leading-none text-[color:var(--ink-soft)] italic ${locale === "my" ? "text-[clamp(1.05rem,3.4vw,1.4rem)] not-italic" : "text-[clamp(1.6rem,5vw,2.2rem)]"}`}>
        {caption}
      </p>
    </section>
  );
}

function VinylDisc() {
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <circle cx="60" cy="60" r="58" fill="#111" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#2a2a2a" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#2a2a2a" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="28" fill="none" stroke="#2a2a2a" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="16" fill="#1a1a1a" />
      <circle cx="60" cy="60" r="7" fill="#f4efe6" />
      <circle cx="60" cy="60" r="2.4" fill="#111" />
    </svg>
  );
}
