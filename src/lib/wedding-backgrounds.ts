/**
 * Artwork that sits softly behind the cover and the closing of an invitation, by wedding slug.
 * Files live in /public/backgrounds. (Kept in code for now; it can move into the admin later.)
 */
export const PAGE_BACKGROUNDS: Record<string, string> = {
  // Kyaw Swar Thin & Aye Thida Myint: an engineers' sketch (cranes, a building going up, blueprints)
  g4tc58rfan5e: "/backgrounds/engineer-sketch.webp",
};

export const backgroundFor = (slug: string): string | null => PAGE_BACKGROUNDS[slug] ?? null;
