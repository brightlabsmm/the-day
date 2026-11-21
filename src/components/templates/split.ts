import type { AlbumPhoto } from "@/lib/album";

/**
 * With enough photos, the first three go into the "Our story" collage and the rest into the gallery.
 * With fewer than five, the story has no collage and the gallery keeps them all.
 */
export function splitPhotos(gallery: AlbumPhoto[]): { story: AlbumPhoto[]; rest: AlbumPhoto[] } {
  return gallery.length >= 5 ? { story: gallery.slice(0, 3), rest: gallery.slice(3) } : { story: [], rest: gallery };
}
