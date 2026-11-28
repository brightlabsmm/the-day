import type { Invitation } from "@/lib/invitation";
import type { AlbumPhoto } from "@/lib/album";
import { t, type Locale } from "@/lib/i18n/numerals";
import { formatLongDate, formatShortDate, formatTimeRange, weddingYear } from "@/lib/i18n/datetime";
import { mediaUrl } from "@/lib/media";
import { ageOf, birthdayLine, invitationTitle, occasionOf } from "@/lib/occasion";

export type TemplateProps = {
  invitation: Invitation;
  locale: Locale;
  monogram: string;
  /** The guest's personal link token, when there is one. */
  token: string | null;
  onOpenAction: (slug: string, token: string) => Promise<void>;
  /** Embedded in the showcase: always start at the opening and never remember it was opened. */
  preview?: boolean;
};

const toAlbum = (p: Invitation["photos"][number], locale: Locale): AlbumPhoto => ({
  id: p.id,
  src: mediaUrl(p.storage_path),
  width: p.width,
  height: p.height,
  alt: t(p.alt, locale),
  kind: p.kind,
});

/** Everything the page designs need, worked out once. */
export function viewOf(invitation: Invitation, locale: Locale) {
  const { wedding, events, photos, guest } = invitation;
  const tz = wedding.timezone;
  const main = events.find((e) => e.kind === "ceremony") ?? events[0] ?? null;
  const coverRaw = photos.find((p) => p.is_cover) ?? photos[0] ?? null;
  const cover = coverRaw ? toAlbum(coverRaw, locale) : null;
  const gallery = photos.filter((p) => p !== coverRaw).map((p) => toAlbum(p, locale));
  const venues = events
    .filter((e) => t(e.venue_name, locale))
    .filter((e, i, all) => all.findIndex((o) => t(o.venue_name, "en") === t(e.venue_name, "en")) === i);
  const lineage = (["partner_one", "partner_two"] as const).some(
    (side) => !!(wedding.family as Record<string, { lineage?: Record<string, string> }>)[side]?.lineage?.[locale],
  );

  return {
    tz,
    main,
    cover,
    gallery,
    venues,
    hasLineage: lineage,
    occasion: occasionOf(wedding.cover_text),
    names: { one: t(wedding.partner_one_name, locale), two: occasionOf(wedding.cover_text) === "birthday" ? "" : t(wedding.partner_two_name, locale) },
    /** "Sacha's 1st Birthday" or "Thiha & Yadanar". */
    title: invitationTitle(wedding, locale),
    /** "1st Birthday"; empty for a wedding. */
    birthday: occasionOf(wedding.cover_text) === "birthday" ? birthdayLine(ageOf(wedding.cover_text, locale), locale) : "",
    year: main ? weddingYear(main.starts_at, tz) : null,
    dateShort: main ? formatShortDate(main.starts_at, tz, locale) : "",
    dateLong: main ? formatLongDate(main.starts_at, tz, locale) : "",
    timeRange: main ? formatTimeRange(main.starts_at, main.ends_at, tz, locale) : "",
    hasGift: wedding.gift_methods.length > 0,
    showWishes: wedding.wishes_enabled && (wedding.public_wishes || !!guest),
    tagline: t(wedding.tagline, locale),
  };
}

export type TemplateView = ReturnType<typeof viewOf>;

/** Splits a tagline such as "Two Hearts / One Journey / Forever" into display words. */
export function taglineWords(tagline: string): string[] {
  return tagline
    .split(/[\/·|,၊]/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 3);
}
