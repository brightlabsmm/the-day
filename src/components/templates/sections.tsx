import { TheDayPromo } from "@/components/the-day-promo";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import type { AlbumPhoto } from "@/lib/album";
import { PhotoGrid } from "./photo-grid";
import { PhotoCollage, type CollageLayout } from "./collage";
import type { ArtKind } from "./art";
import type { NavItem } from "./nav";
import type { TemplateView } from "./view";
import type { Invitation } from "@/lib/invitation";
import { isHidden } from "@/lib/theme";
import { hasDress, hasFaq, hasSeat, hasStory } from "./extras";

export function TplGallery({
  photos,
  locale,
  mono = false,
  collage,
}: {
  photos: AlbumPhoto[];
  locale: Locale;
  mono?: boolean;
  collage?: { art: ArtKind; layout: CollageLayout; frame?: "plain" | "white" };
}) {
  if (photos.length === 0) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
      <div className="tpl-wide">
        <p className="tpl-eyebrow">{s("galleryEyebrow", locale)}</p>
        <h2 id="gallery-heading" className="tpl-h2 mb-10 sm:mb-14">
          {s("galleryHeading", locale)}
        </h2>
        {collage ? <PhotoCollage photos={photos} locale={locale} {...collage} /> : <PhotoGrid photos={photos} locale={locale} mono={mono} />}
      </div>
    </section>
  );
}

export function TplFooter({ v, locale, thanks = true, promo = true, strong = false }: { v: TemplateView; locale: Locale; thanks?: boolean; promo?: boolean; strong?: boolean }) {
  return (
    <footer lang={locale} className="px-6 pt-6 pb-[46px] text-center">
      {thanks && <p className={`tpl-display text-[color:var(--navy)] ${locale === "my" ? "text-[1.05rem]" : "text-[1.3rem]"}`}>{s("closingThanks", locale)}</p>}
      <p className={`tpl-eyebrow ${thanks ? "mt-6" : ""} ${strong ? "!text-[color:var(--ink)]" : ""}`}>
        {v.names.one} &amp; {v.names.two}
        {v.year ? ` • ${v.year}` : ""}
      </p>
      {promo && <TheDayPromo locale={locale} />}
    </footer>
  );
}

/** Section links for the top bar, only for sections that will actually be on the page. */
export function navItemsFor(v: TemplateView, invitation: Invitation, locale: Locale): NavItem[] {
  const items: NavItem[] = [{ id: "invitation", label: s("navInvitation", locale) }];
  if (hasStory(invitation)) items.push({ id: "story", label: s("navStory", locale) });
  if (invitation.events.length && !isHidden(invitation, "schedule")) items.push({ id: "schedule", label: s("navSchedule", locale) });
  if (v.gallery.length) items.push({ id: "gallery", label: s("navGallery", locale) });
  if (v.venues.length) items.push({ id: "venue", label: s("navVenue", locale) });
  if (hasDress(invitation)) items.push({ id: "dress", label: s("navDress", locale) });
  if (invitation.wedding.rsvp_enabled) items.push({ id: "rsvp", label: s("navRsvp", locale) });
  if (hasSeat(invitation)) items.push({ id: "seat", label: s("navSeat", locale) });
  if (hasFaq(invitation)) items.push({ id: "faq", label: s("navFaq", locale) });
  if (v.hasGift) items.push({ id: "gift", label: s("navGift", locale) });
  if (v.showWishes) items.push({ id: "wishes", label: s("navWishes", locale) });
  return items;
}
