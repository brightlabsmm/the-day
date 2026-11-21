"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { Equalizer } from "./record-player";

export type Chapter = { label: string; title: string; text: string };

/**
 * The story as a playlist: pick a chapter from the list, or press play and
 * it turns the pages by itself every few seconds.
 */
export function StoryPlayer({ chapters, locale }: { chapters: Chapter[]; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = chapters.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (index >= last) setPlaying(false);
      else setIndex(index + 1);
    }, 7000);
    return () => window.clearTimeout(id);
  }, [playing, index, last]);

  const current = chapters[index];
  const iconBtn = "grid size-11 place-items-center rounded-full border border-[color:var(--navy)]/30 transition hover:bg-[color:var(--navy)] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit";

  return (
    <div className="grid gap-8 text-left md:grid-cols-[1fr_1.1fr] md:gap-12">
      <div className="rounded-2xl bg-[color:var(--paper)] p-7 shadow-[0_18px_40px_-28px_rgba(46,67,120,.6)]">
        <p className="tpl-eyebrow !text-left !text-[color:var(--gold)]">
          <Equalizer on={playing} className="mr-2 align-middle" />
          {s("nowPlaying", locale)} · {s("chapter", locale)} {formatNumber(index + 1, locale, 2)}
        </p>
        <div aria-live="polite" className="min-h-[11rem]">
          {current.label && <p className="tpl-eyebrow mt-5 !text-left">{current.label}</p>}
          <h3 className="tpl-display mt-2 text-[1.7rem] leading-snug text-[color:var(--navy)]">{current.title}</h3>
          <p className="mt-3 leading-[1.95] whitespace-pre-line text-[color:var(--ink-soft)]">{current.text}</p>
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[color:var(--navy)]/15">
          <div className="h-full rounded-full bg-[color:var(--gold)] transition-[width] duration-500" style={{ width: `${((index + 1) / chapters.length) * 100}%` }} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-4">
          <button type="button" className={iconBtn} disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label={s("prevTrack", locale)}>
            <SkipBack className="size-5" />
          </button>
          <button
            type="button"
            className="grid size-14 place-items-center rounded-full bg-[color:var(--navy)] text-white shadow-md transition hover:scale-105"
            onClick={() => {
              if (!playing && index >= last) setIndex(0);
              setPlaying((v) => !v);
            }}
            aria-pressed={playing}
            aria-label={s(playing ? "storyPause" : "storyPlay", locale)}
          >
            {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
          </button>
          <button type="button" className={iconBtn} disabled={index === last} onClick={() => setIndex(index + 1)} aria-label={s("nextTrack", locale)}>
            <SkipForward className="size-5" />
          </button>
        </div>
      </div>

      <ol className="divide-y divide-[color:var(--navy)]/15 self-center">
        {chapters.map((c, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "true" : undefined}
              className={`grid w-full grid-cols-[2.2rem_1fr_auto] items-center gap-3 py-4 text-left transition ${i === index ? "text-[color:var(--navy)]" : "text-[color:var(--ink-soft)] hover:text-[color:var(--navy)]"}`}
            >
              <span className="tpl-display text-[0.95rem] opacity-70">{formatNumber(i + 1, locale, 2)}</span>
              <span>
                <span className={`tpl-display block text-[1.1rem] leading-snug ${i === index ? "font-bold" : ""}`}>{c.title}</span>
                {c.label && <span className="tpl-eyebrow block !text-left !text-[0.6rem]">{c.label}</span>}
              </span>
              {i === index && <Equalizer on={playing} className="text-[color:var(--gold)]" />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
