import Image from "next/image";
import { t } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplDressCode, TplFaq, TplSeat, TplTips, TplRsvp, TplStory } from "./extras";
import { TrackOpen } from "./track-open";
import { Parallax } from "./parallax";
import { TplFooter, TplGallery, navItemsFor } from "./sections";
import { taglineWords, viewOf, type TemplateProps } from "./view";

/** Black-and-white, magazine style: full-screen photo, giant monogram, oversized words. */
export function EditorialPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding } = invitation;
  const [m1, m2] = monogram.split("&");
  const words = taglineWords(v.tagline);
  const feature = v.gallery[0] ?? v.cover;
  const band = v.gallery[1] ?? v.cover;

  return (
    <div className="tpl tpl-editorial" lang={locale}>
      <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
      <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="dark" />

      <header id="top" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white">
        {v.cover && (
          <Image src={v.cover.src} alt="" fill priority sizes="100vw" className="tpl-hero-photo object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <div className="relative z-10">
          <h1 className="sr-only">
            {v.names.one} &amp; {v.names.two}
          </h1>
          <p
            aria-hidden
            className="tpl-display text-[clamp(7rem,32vw,18rem)] leading-[0.85] font-normal tracking-[-0.06em] normal-case"
          >
            {m1}
            <span className="mx-[-0.04em] align-middle text-[0.5em] italic">&amp;</span>
            {m2}
          </p>
          <p className="tpl-eyebrow mt-8 !text-white">
            {v.names.one} &amp; {v.names.two}
          </p>
          {v.dateLong && <p className="tpl-display mt-3 text-[1.1rem] italic opacity-90">{v.dateLong}</p>}
        </div>
        <p className="tpl-eyebrow absolute bottom-6 !text-white/70">{s("scrollDown", locale)} ↓</p>
      </header>

      {words.length >= 2 && (
        <section aria-label={v.tagline} lang={locale} className="relative overflow-hidden px-4 py-[clamp(5rem,14vw,9rem)] text-center">
          <div className="tpl-giant space-y-[0.08em] text-[clamp(2.6rem,12.5vw,9.5rem)] text-[color:var(--navy)]">
            {words.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
          {feature && (
            <div className="absolute top-1/2 left-1/2 w-[clamp(7rem,30vw,19rem)] -translate-x-1/2 -translate-y-1/2">
              <Parallax speed={0.18}>
                <div className="relative aspect-[3/4] overflow-hidden shadow-2xl">
                  <Image src={feature.src} alt="" fill sizes="(max-width: 768px) 30vw, 300px" className="object-cover grayscale" />
                </div>
              </Parallax>
            </div>
          )}
        </section>
      )}

      <InvitationMessage invitation={invitation} locale={locale} plain />

      {v.main && (
        <section aria-labelledby="countdown-heading" lang={locale} className="relative overflow-hidden bg-black px-4 py-[clamp(4rem,10vw,7rem)] text-center text-white">
          {band && <Image src={band.src} alt="" fill sizes="100vw" className="object-cover opacity-40 grayscale" />}
          <p id="countdown-heading" className="tpl-eyebrow relative !text-white/80">
            {s("untilTheWedding", locale)}
          </p>
          <div className="relative mt-8">
            <PlainCountdown targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
          </div>
        </section>
      )}

      <Reveal><TplStory invitation={invitation} locale={locale} /></Reveal>

      <Reveal><Schedule invitation={invitation} locale={locale} /></Reveal>
      <Reveal><TplGallery photos={v.gallery} locale={locale} mono /></Reveal>
      <Reveal><Venue invitation={invitation} locale={locale} /></Reveal>
      <Reveal><TplDressCode invitation={invitation} locale={locale} /></Reveal>
      <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} /></Reveal>
      <Reveal><TplTips invitation={invitation} locale={locale} />
<TplSeat invitation={invitation} locale={locale} />
<TplFaq invitation={invitation} locale={locale} /></Reveal>
      <Reveal><GiftSection invitation={invitation} locale={locale} plain /></Reveal>
      <Reveal><WishesSection invitation={invitation} locale={locale} token={token} plain /></Reveal>
      <ClosingQuote invitation={invitation} locale={locale} />
      <TplFooter v={v} locale={locale} />
      <span className="sr-only">{t(wedding.partner_one_name, locale)}</span>
    </div>
  );
}
