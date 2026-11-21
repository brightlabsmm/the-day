import Image from "next/image";
import { t } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { Gate } from "./gate";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { PhotoGrid } from "./photo-grid";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplDressCode, TplFaq, TplRsvp, TplStory } from "./extras";
import { TrackOpen } from "./track-open";
import { WildflowerBorder } from "./wildflowers";
import { TplFooter, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

const BOUGAINVILLEA = ["#d9487a", "#e8709a", "#f2a3bf", "#b8316a", "#f7c9d9"];

/** Blue wooden shutters open onto the invitation: whitewash, bougainvillea and arched windows. */
export function ShuttersPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, guest } = invitation;
  const message = t(wedding.invitation_text, locale);
  const place = v.venues[0] ? t(v.venues[0].venue_name, locale) : "";

  return (
    <Gate
      kind="shutters"
      slug={wedding.slug}
      // Recording that a guest opened their link is left to <TrackOpen>, because the shutters open on their own.
      token={null}
      locale={locale}
      monogram={monogram}
      coverSrc={v.cover?.src ?? null}
      guestLabel={guestName(guest, locale)}
      dateLabel={v.dateShort}
      names={v.names}
      place={place}
      onOpenAction={onOpenAction}
      preview={preview}
    >
      <div className="tpl tpl-shutters" lang={locale}>
        <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" />

        <header id="top" className="px-4 pt-24 pb-6 text-center">
          <div className="relative mx-auto w-[min(94vw,34rem)]">
            <div aria-hidden className="absolute -inset-x-6 -top-6 h-[22rem] opacity-90">
              <WildflowerBorder seed={9} height={360} blooms={BOUGAINVILLEA} />
            </div>

            {/* an open window: shutters either side of an arched view */}
            <div className="relative mx-auto flex w-[88%] items-stretch justify-center gap-1.5 pt-6">
              <div aria-hidden className="tpl-planks w-[17%] shadow-[inset_0_0_0_4px_#123a7a] [clip-path:polygon(0_5%,100%_0,100%_100%,0_95%)]" />
              <figure className="relative aspect-[3/4] w-[58%] overflow-hidden rounded-t-[999px] border-[6px] border-[#fbf7f1] shadow-[0_0_0_5px_#1e4f9c,0_20px_40px_-18px_rgba(30,79,156,.55)]">
                {v.cover ? (
                  <Image src={v.cover.src} alt={v.cover.alt} fill priority sizes="(max-width: 640px) 60vw, 320px" className="object-cover" />
                ) : (
                  <div className="size-full bg-[linear-gradient(180deg,#c4dff1,#6aa3d2)]" />
                )}
              </figure>
              <div aria-hidden className="tpl-planks w-[17%] shadow-[inset_0_0_0_4px_#123a7a] [clip-path:polygon(0_0,100%_5%,100%_95%,0_100%)]" />
            </div>
          </div>

          <p className="tpl-eyebrow mt-10">{s("weddingInvitationLabel", locale)}</p>
          <h1 className="tpl-script mt-4 text-[clamp(2.8rem,11vw,5.6rem)] text-[color:var(--navy)]">
            {v.names.one}
            <span className="mx-[0.25em] text-[0.6em] text-[color:var(--gold)]">&amp;</span>
            {v.names.two}
          </h1>
          {v.dateLong && <p className="tpl-display mt-5 text-[1.2rem] text-[color:var(--ink)]">{v.dateLong}</p>}
          {place && <p className="tpl-eyebrow mt-2">{place}</p>}
        </header>

        {v.hasLineage ? (
          <Reveal>
            <InvitationMessage invitation={invitation} locale={locale} plain />
          </Reveal>
        ) : (
          message && (
            <Reveal>
              <section id="invitation" aria-label={s("weddingInvitationLabel", locale)} lang={locale} className="px-6 py-8">
                <p className="tpl-lead mx-auto max-w-md whitespace-pre-line">{message}</p>
              </section>
            </Reveal>
          )
        )}

        {v.main && (
          <section aria-labelledby="countdown-heading" lang={locale} className="bg-[color:var(--paper)] px-4 py-[clamp(3.5rem,9vw,6rem)] text-center text-[color:var(--navy)]">
            <p id="countdown-heading" className="tpl-eyebrow mb-8">
              {s("untilTheWedding", locale)}
            </p>
            <PlainCountdown variant="cards" targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
          </section>
        )}

        <Reveal>
          <TplStory invitation={invitation} locale={locale} />
        </Reveal>
        <Reveal>
          <Schedule invitation={invitation} locale={locale} />
        </Reveal>

        {v.gallery.length > 0 && (
          <Reveal>
            <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
              <div className="tpl-wide">
                <p className="tpl-eyebrow">{s("galleryEyebrow", locale)}</p>
                <h2 id="gallery-heading" className="tpl-h2 mb-10">
                  {s("galleryHeading", locale)}
                </h2>
                <PhotoGrid photos={v.gallery} locale={locale} arch />
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <Venue invitation={invitation} locale={locale} />
        </Reveal>
        <Reveal>
          <TplDressCode invitation={invitation} locale={locale} />
        </Reveal>
        <Reveal>
          <TplRsvp invitation={invitation} locale={locale} token={token} />
        </Reveal>
        <Reveal>
          <TplFaq invitation={invitation} locale={locale} />
        </Reveal>
        <Reveal>
          <GiftSection invitation={invitation} locale={locale} plain />
        </Reveal>
        <Reveal>
          <WishesSection invitation={invitation} locale={locale} token={token} plain />
        </Reveal>
        <ClosingQuote invitation={invitation} locale={locale} />
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
