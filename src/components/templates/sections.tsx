import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import type { AlbumPhoto } from "@/lib/album";
import { PhotoGrid } from "./photo-grid";
import type { NavItem } from "./nav";
import type { TemplateView } from "./view";
import type { Invitation } from "@/lib/invitation";

export function TplGallery({ photos, locale, mono = false }: { photos: AlbumPhoto[]; locale: Locale; mono?: boolean }) {
  if (photos.length === 0) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
      <div className="tpl-wide">
        <p className="tpl-eyebrow">{s("galleryEyebrow", locale)}</p>
        <h2 id="gallery-heading" className="tpl-h2 mb-10 sm:mb-14">
          {s("galleryHeading", locale)}
        </h2>
        <PhotoGrid photos={photos} locale={locale} mono={mono} />
      </div>
    </section>
  );
}

export function TplFooter({ v, locale }: { v: TemplateView; locale: Locale }) {
  return (
    <footer lang={locale} className="px-6 pt-6 pb-14 text-center">
      <p className="tpl-display text-[1.3rem] text-[color:var(--navy)]">{s("closingThanks", locale)}</p>
      <p className="tpl-eyebrow mt-6">
        {v.names.one} &amp; {v.names.two}
        {v.year ? ` • ${v.year}` : ""}
      </p>
    </footer>
  );
}

/** Section links for the top bar, only for sections that will actually be on the page. */
export function navItemsFor(v: TemplateView, invitation: Invitation, locale: Locale): NavItem[] {
  const items: NavItem[] = [{ id: "invitation", label: s("navInvitation", locale) }];
  if (invitation.events.length) items.push({ id: "schedule", label: s("navSchedule", locale) });
  if (v.gallery.length) items.push({ id: "gallery", label: s("navGallery", locale) });
  if (v.venues.length) items.push({ id: "venue", label: s("navVenue", locale) });
  if (v.hasGift) items.push({ id: "gift", label: s("navGift", locale) });
  if (v.showWishes) items.push({ id: "wishes", label: s("navWishes", locale) });
  return items;
}
