"use client";

import Image from "next/image";
import { useState } from "react";
import type { AlbumPhoto } from "@/lib/album";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { Viewer } from "@/components/invite/gallery";

/** Even photo grid; album spreads take a full row. Tapping opens the full-screen viewer. */
export function PhotoGrid({
  photos,
  locale,
  mono = false,
  arch = false,
  rounded = false,
  polaroid = false,
}: {
  photos: AlbumPhoto[];
  locale: Locale;
  /** Show the photos in black and white (Editorial). */
  mono?: boolean;
  /** Arch-topped frames with a thin outline (Wildflower). */
  arch?: boolean;
  /** Softly rounded corners (Silk). */
  rounded?: boolean;
  /** White instant-photo frames, slightly tilted (Polaroid). */
  polaroid?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
        {photos.map((p, i) => {
          const wide = p.kind === "spread" && !arch;
          return (
            <li
              key={p.id}
              style={polaroid ? { transform: `rotate(${[-2.2, 1.6, -1, 2.4, -1.8, 1.2][i % 6]}deg)` } : undefined}
              className={`${polaroid ? "bg-white p-2 pb-8 shadow-[0_10px_24px_-12px_rgba(60,40,20,.55)]" : ""} ${wide ? "col-span-2 md:col-span-3" : ""} ${arch ? "rounded-t-[999px] border border-[color:var(--gold-soft)] p-1.5" : ""}`}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
                className={`tpl-grid-photo ${wide ? "aspect-[16/9]" : arch ? "aspect-[3/4] rounded-t-[999px]" : "aspect-[4/5]"} ${rounded ? "rounded-2xl" : ""}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={wide ? "(max-width: 1100px) 100vw, 1100px" : "(max-width: 768px) 50vw, 360px"}
                  className={`object-cover ${mono ? "grayscale" : ""}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {index !== null && (
        <Viewer photos={photos} index={index} locale={locale} onChange={setIndex} onClose={() => setIndex(null)} />
      )}
    </>
  );
}
