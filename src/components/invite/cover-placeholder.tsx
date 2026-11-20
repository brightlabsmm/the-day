import Image from "next/image";
import type { Invitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { t } from "@/lib/i18n/numerals";
import { mediaUrl } from "@/lib/media";
import { DoubleRule, Rule } from "@/components/ornaments";
import { s } from "@/lib/i18n/strings";

/** Stand-in for the invitation cover; replaced by the real cover in milestone 3. */
export function CoverPlaceholder({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const { wedding, photos } = invitation;
  const cover = photos.find((p) => p.is_cover) ?? photos[0];

  return (
    <main lang={locale} className="mx-auto min-h-svh max-w-[430px] px-4 py-8">
      <article className="paper frame-double px-6 py-10 text-center text-navy">
        <DoubleRule />
        <h2 className="foil font-display my-2 text-[clamp(1.4rem,7.4vw,2.2rem)] leading-none font-bold whitespace-nowrap">
          THE WEDDING DAY
        </h2>
        <DoubleRule />
        {cover && (
          <div className="mt-6 border border-navy/50 p-1">
            <Image
              src={mediaUrl(cover.storage_path)}
              alt={t(cover.alt, locale)}
              width={cover.width}
              height={cover.height}
              sizes="(max-width: 430px) 85vw, 360px"
              quality={85}
              loading="eager"
              fetchPriority="high"
              className="h-auto w-full"
            />
          </div>
        )}
        <div lang={locale} className="mt-6">
          <p className="foil font-display text-4xl font-semibold [&:lang(my)]:text-3xl">{t(wedding.partner_one_name, locale)}</p>
          <div className="my-1 flex items-center gap-3">
            <Rule className="flex-1" />
            <span className="font-display text-xl text-gold italic">{s("and", locale)}</span>
            <Rule className="flex-1" />
          </div>
          <p className="foil font-display text-4xl font-semibold [&:lang(my)]:text-3xl">{t(wedding.partner_two_name, locale)}</p>
        </div>
        <p className="label-caps mt-8 text-[0.6rem] text-ink-soft">Full cover arrives in milestone 3</p>
      </article>
    </main>
  );
}
