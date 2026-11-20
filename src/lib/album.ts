export type AlbumPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: "portrait" | "couple" | "traditional" | "spread";
};

/** One row of the album: a single wide print, or two portrait prints side by side. */
export type AlbumRow = { type: "single"; photos: [AlbumPhoto] } | { type: "pair"; photos: [AlbumPhoto, AlbumPhoto] };

const isPortrait = (p: AlbumPhoto) => p.height > p.width * 1.1;

/**
 * Lays photos out like a printed album, keeping their order and proportions:
 * landscape photos and spreads get a full row; consecutive portrait photos
 * are paired. A lone portrait gets its own (narrower) row.
 */
export function albumRows(photos: AlbumPhoto[]): AlbumRow[] {
  const rows: AlbumRow[] = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const next = photos[i + 1];
    if (isPortrait(p) && next && isPortrait(next) && p.kind !== "spread" && next.kind !== "spread") {
      rows.push({ type: "pair", photos: [p, next] });
      i++;
    } else {
      rows.push({ type: "single", photos: [p] });
    }
  }
  return rows;
}

export { isPortrait };
