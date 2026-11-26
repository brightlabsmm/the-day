import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import { getInvitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { t } from "@/lib/i18n/numerals";
import { guestName } from "@/lib/i18n/strings";
import { Opening } from "@/components/invite/opening";
import { SleeveShell } from "@/components/invite/sleeve-parts";
import { InvitationBody } from "@/components/invite/invitation-body";
import { LanguageSwitch } from "@/components/invite/language-switch";
import { MusicPlayer } from "@/components/invite/music-player";
import { Snowfall } from "@/components/invite/snowfall";
import { themeOf } from "@/lib/theme";
import { mediaUrl } from "@/lib/media";
import { templateKey } from "@/lib/templates";
import { EditorialPage } from "@/components/templates/editorial-page";
import { EnvelopePage } from "@/components/templates/envelope-page";
import { ScratchPage } from "@/components/templates/scratch-page";
import { RecordPage } from "@/components/templates/record-page";
import { WildflowerPage } from "@/components/templates/wildflower-page";
import { ShuttersPage } from "@/components/templates/shutters-page";
import { MidnightPage } from "@/components/templates/midnight-page";
import { LanternPage } from "@/components/templates/lantern-page";
import { PolaroidPage } from "@/components/templates/polaroid-page";
import { BotanicalPage } from "@/components/templates/botanical-page";
import { ArtDecoPage } from "@/components/templates/artdeco-page";
import { SunrisePage } from "@/components/templates/sunrise-page";
import { SpotlightPage } from "@/components/templates/spotlight-page";
import { GardenPage } from "@/components/templates/garden-page";
import { RibbonPage } from "@/components/templates/ribbon-page";
import { RenewalPage } from "@/components/templates/renewal-page";
import { ScrapbookPage } from "@/components/templates/scrapbook-page";
import { SilkPage } from "@/components/templates/silk-page";
import { TheatrePage } from "@/components/templates/theatre-page";
import { markOpened } from "./actions";

/**
 * Link previews (Messenger, Viber, Telegram). Deliberately generic: the
 * guest's name is never put in metadata, and the page is not indexed.
 */
export async function generateMetadata({ params }: PageProps<"/w/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug, undefined);
  if (!invitation) return { title: "Invitation", robots: { index: false, follow: false } };

  const { wedding, photos } = invitation;
  const names = `${t(wedding.partner_one_name, "en")} & ${t(wedding.partner_two_name, "en")}`;
  const title = `${names} — Wedding Invitation`;
  const description = t(wedding.tagline, "en") || "You are warmly invited to our wedding.";
  const cover = photos.find((p) => p.is_cover) ?? photos[0];
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      images: cover ? [{ url: mediaUrl(cover.storage_path), width: cover.width, height: cover.height }] : undefined,
    },
    twitter: { card: cover ? "summary_large_image" : "summary", title, description },
  };
}

export default function InvitationPage(props: PageProps<"/w/[slug]">) {
  return (
    <Suspense fallback={<SleeveShell />}>
      <InvitationRoute {...props} />
    </Suspense>
  );
}

async function InvitationRoute({ params, searchParams }: PageProps<"/w/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const token = typeof query.g === "string" ? query.g : undefined;
  // The showcase embeds pages with ?preview=1 so every preview starts at its opening screen.
  const preview = query.preview === "1";
  const chosen: Locale = resolveLocale(query.lang, (await cookies()).get(LOCALE_COOKIE)?.value);

  const invitation = await getInvitation(slug, token);
  if (!invitation) notFound();

  const { wedding, guest } = invitation;
  // A demo can be English only (cover_text.english_only), whatever language the visitor last chose.
  const englishOnly = (wedding.cover_text as Record<string, unknown> | null)?.english_only === true;
  const locale: Locale = englishOnly ? "en" : chosen;
  const theme = themeOf(invitation);
  const monogram =
    wedding.monogram ??
    `${t(wedding.partner_one_name, "en").charAt(0)}&${t(wedding.partner_two_name, "en").charAt(0)}`;

  // On a developer machine only, `?design=<key>` previews any design with this wedding's content.
  const key = templateKey(process.env.NODE_ENV !== "production" && typeof query.design === "string" ? query.design : wedding.template_key);
  if (key !== "classic") {
    const props = {
      invitation,
      locale,
      monogram,
      token: guest ? (token ?? null) : null,
      onOpenAction: markOpened,
      preview,
    };
    return (
      <>
        {wedding.music_path && key !== "record" && (
          <MusicPlayer src={mediaUrl(wedding.music_path)} title={wedding.music_title} locale={locale} />
        )}
        {theme.snow && <Snowfall />}
        {key === "editorial" ? (
          <EditorialPage {...props} />
        ) : key === "envelope" ? (
          <EnvelopePage {...props} />
        ) : key === "theatre" ? (
          <TheatrePage {...props} />
        ) : key === "record" ? (
          <RecordPage {...props} />
        ) : key === "wildflower" ? (
          <WildflowerPage {...props} />
        ) : key === "shutters" ? (
          <ShuttersPage {...props} />
        ) : key === "silk" ? (
          <SilkPage {...props} />
        ) : key === "midnight" ? (
          <MidnightPage {...props} />
        ) : key === "lantern" ? (
          <LanternPage {...props} />
        ) : key === "polaroid" ? (
          <PolaroidPage {...props} />
        ) : key === "botanical" ? (
          <BotanicalPage {...props} />
        ) : key === "artdeco" ? (
          <ArtDecoPage {...props} />
        ) : key === "sunrise" ? (
          <SunrisePage {...props} />
        ) : key === "spotlight" ? (
          <SpotlightPage {...props} />
        ) : key === "garden" ? (
          <GardenPage {...props} />
        ) : key === "ribbon" ? (
          <RibbonPage {...props} />
        ) : key === "renewal" ? (
          <RenewalPage {...props} />
        ) : key === "scrapbook" ? (
          <ScrapbookPage {...props} />
        ) : (
          <ScratchPage {...props} />
        )}
      </>
    );
  }

  return (
    <>
      <LanguageSwitch locale={locale} />
      {wedding.music_path && (
        <MusicPlayer src={mediaUrl(wedding.music_path)} title={wedding.music_title} locale={locale} />
      )}
      {theme.snow && <Snowfall />}
      <Opening
        slug={wedding.slug}
        token={guest ? (token ?? null) : null}
        locale={locale}
        monogram={monogram}
        guestLabel={guestName(guest, locale)}
        coupleNames={{ one: t(wedding.partner_one_name, locale), two: t(wedding.partner_two_name, locale) }}
        onOpenAction={markOpened}
        preview={preview}
      >
        <InvitationBody invitation={invitation} locale={locale} monogram={monogram} token={guest ? (token ?? null) : null} />
      </Opening>
    </>
  );
}
