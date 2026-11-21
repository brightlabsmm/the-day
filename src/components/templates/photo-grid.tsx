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
}: {
  photos: AlbumPhoto[];
  locale: Locale;
  /** Show the photos in black and white (Editorial). */
  mono?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
        {photos.map((p, i) => {
          const wide = p.kind === "spread";
          return (
            <li key={p.id} className={wide ? "col-span-2 md:col-span-3" : ""}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
                className={`tpl-grid-photo ${wide ? "aspect-[16/9]" : "aspect-[4/5]"}`}
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
