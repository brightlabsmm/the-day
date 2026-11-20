import type { Invitation } from "@/lib/invitation";
import type { AlbumPhoto } from "@/lib/album";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { mediaUrl } from "@/lib/media";
import { InnerCard } from "./inner-card";
import { Gallery } from "./gallery";

/** Album page with every photo except the cover, which is already on the front. */
export function GallerySection({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const photos: AlbumPhoto[] = invitation.photos
    .filter((p) => !p.is_cover)
    .map((p) => ({
      id: p.id,
      src: mediaUrl(p.storage_path),
      width: p.width,
      height: p.height,
      alt: t(p.alt, locale),
      kind: p.kind,
    }));

  if (photos.length === 0) return null;

  return (
    <InnerCard id="gallery-heading" heading={s("galleryHeading", locale)} lang={locale}>
      <Gallery photos={photos} locale={locale} />
    </InnerCard>
  );
}
