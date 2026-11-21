"use client";

/*
 * Overlapping photo collages with an illustration tile among the photos.
 * Three arrangements so the designs do not all lay out their albums alike:
 *  - mosaic: a big photo, an illustration tile and a second photo overlapping both
 *  - scatter: photos tilted and offset left and right, the tile tucked between them
 *  - stack: a staggered column, the tile as a wide band
 * Every group takes three photos; leftovers are shown as an even pair row.
 */
import Image from "next/image";
import { useState } from "react";
import type { AlbumPhoto } from "@/lib/album";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { Viewer } from "@/components/invite/gallery";
import { Artwork, type ArtKind } from "./art";

export type CollageLayout = "mosaic" | "scatter" | "stack";

export function PhotoCollage({
  photos,
  locale,
  art,
  layout = "mosaic",
  frame = "plain",
}: {
  photos: AlbumPhoto[];
  locale: Locale;
  art: ArtKind;
  layout?: CollageLayout;
  /** "white" adds a white keyline around each piece. */
  frame?: "plain" | "white";
}) {
  const [index, setIndex] = useState<number | null>(null);
  const groups: AlbumPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 3) groups.push(photos.slice(i, i + 3));
  const ring = frame === "white" ? "ring-[5px] ring-white" : "";
  const shadow = "shadow-[0_18px_34px_-16px_rgba(30,20,10,.55)]";

  const Photo = ({ p, className, sizes = "(max-width: 768px) 60vw, 360px" }: { p: AlbumPhoto; className: string; sizes?: string }) => (
    <button
      type="button"
      onClick={() => setIndex(photos.indexOf(p))}
      aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
      className={`absolute overflow-hidden ${ring} ${shadow} ${className}`}
    >
      <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover" />
    </button>
  );
  const Tile = ({ className }: { className: string }) => (
    <div aria-hidden className={`absolute overflow-hidden ${ring} ${shadow} ${className}`}>
      <Artwork kind={art} className="size-full" />
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-10 sm:space-y-14">
        {groups.map((g, gi) => {
          if (g.length < 3) {
            return (
              <ul key={gi} className="grid grid-cols-2 gap-4">
                {g.map((p) => (
                  <li key={p.id} className="relative aspect-[4/5]">
                    <Photo p={p} className="inset-0" />
                  </li>
                ))}
              </ul>
            );
          }
          const flip = gi % 2 === 1;
          if (layout === "scatter") {
            return (
              <div key={gi} className="relative mx-auto aspect-[1/1.02] w-full max-w-xl">
                <Photo p={g[0]} className={`top-0 h-[58%] w-[52%] ${flip ? "right-0 rotate-3" : "left-0 -rotate-3"}`} />
                <Tile className={`top-[10%] h-[46%] w-[40%] ${flip ? "left-0 -rotate-2" : "right-0 rotate-2"}`} />
                <Photo p={g[1]} className={`bottom-0 h-[52%] w-[48%] ${flip ? "left-[2%] -rotate-3" : "right-[2%] rotate-3"}`} />
                <Photo p={g[2]} className={`bottom-[6%] h-[40%] w-[40%] ${flip ? "right-[8%] rotate-1" : "left-[8%] -rotate-1"}`} />
              </div>
            );
          }
          if (layout === "stack") {
            return (
              <div key={gi} className="relative mx-auto aspect-[3/4] w-full max-w-md sm:aspect-[4/5]">
                <Photo p={g[0]} className={`top-0 h-[40%] w-[64%] ${flip ? "right-0" : "left-0"}`} />
                <Tile className={`top-[30%] h-[22%] w-[86%] ${flip ? "left-0" : "right-0"}`} />
                <Photo p={g[1]} className={`top-[46%] h-[54%] w-[52%] ${flip ? "right-[6%]" : "left-[6%]"}`} />
                <Photo p={g[2]} className={`bottom-0 h-[36%] w-[40%] ${flip ? "left-0" : "right-0"}`} />
              </div>
            );
          }
          return (
            <div key={gi} className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <Photo p={g[0]} className={`top-0 h-[62%] w-[62%] ${flip ? "right-0" : "left-0"}`} />
              <Tile className={`top-0 h-[44%] w-[34%] ${flip ? "left-0" : "right-0"}`} />
              <Photo p={g[1]} className={`bottom-0 h-[56%] w-[52%] ${flip ? "left-[4%]" : "right-[4%]"}`} />
              <Photo p={g[2]} className={`bottom-[4%] h-[30%] w-[38%] ${flip ? "right-[4%]" : "left-[4%]"}`} />
            </div>
          );
        })}
      </div>
      {index !== null && <Viewer photos={photos} index={index} locale={locale} onChange={setIndex} onClose={() => setIndex(null)} />}
    </>
  );
}
