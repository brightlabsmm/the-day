import Image from "next/image";
import { t } from "@/lib/i18n/numerals";
import { zonedParts } from "@/lib/i18n/datetime";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { splitPhotos } from "./split";
import { Gate } from "./gate";
import { TemplateNav } from "./nav";
import { BrowseCalendar } from "./browse-calendar";
import { PlainCountdown } from "./plain-countdown";
import { PhotoCollage } from "./collage";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplFaq, TplSeat, TplTips, TplRsvp, TplStory, dressOf } from "./extras";
import { TrackOpen } from "./track-open";
import { TplFooter, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Spotlight: curtains lit by a spotlight open onto a full-photo hero with script names on the left. */
export function SpotlightPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const split = splitPhotos(v.gallery);
  const { wedding, guest } = invitation;
  const [m1, m2] = monogram.split("&");
  const message = t(wedding.invitation_text, locale);
  const place = v.venues[0] ? t(v.venues[0].venue_name, locale) : "";
  const dress = dressOf(invitation);
  const when = v.main ? zonedParts(v.main.starts_at, v.tz) : null;
  const cta = invitation.wedding.rsvp_enabled ? "#rsvp" : "#schedule";

  return (
    <Gate
      kind="spotlight"
      slug={wedding.slug}
      token={guest ? token : null}
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
      <div className="tpl tpl-spotlight" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="dark" />

        <header id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-24 pb-12 text-[#f4efdd] sm:px-12">
          {v.cover ? (
            <Image src={v.cover.src} alt={v.cover.alt ?? ""} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(160deg,#2c3020,#0f100a)]" />
          )}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,6,.55),rgba(10,10,6,.2) 40%,rgba(10,10,6,.78))]" />
          <div className="relative max-w-xl">
            <p className="tpl-eyebrow !text-[#e8d9a8]">{s("celebratingOn", locale)}</p>
            <h1 className="mt-6 text-[clamp(3.4rem,15vw,7rem)] leading-[0.95]" style={{ fontFamily: "var(--font-script), var(--font-playfair), serif" }}>
              {v.names.one}
              <span className="block pl-[0.9em] text-[0.5em] text-[#e8d9a8]">{s("and", locale)}</span>
              {v.names.two}
            </h1>
            <dl className="mt-10 grid grid-cols-[auto_1px_1fr] items-center gap-x-6 text-left">
              <div>
                <dt className="tpl-eyebrow !text-[#e8d9a8]">{s("dateLabel", locale)}</dt>
                <dd className="tpl-display mt-1 text-[1.25rem]">{v.dateShort}</dd>
              </div>
              <span aria-hidden className="h-12 bg-[#e8d9a8]/50" />
              <div>
                <dt className="tpl-eyebrow !text-[#e8d9a8]">{s("venueLabel", locale)}</dt>
                <dd className="tpl-display mt-1 text-[1.25rem]">{place}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="tpl-order">
        {v.hasLineage ? (
          <Reveal>
            <InvitationMessage invitation={invitation} locale={locale} plain />
          </Reveal>
        ) : (
          message && (
            <Reveal>
              <section id="invitation" aria-label={s("weddingInvitationLabel", locale)} lang={locale} className="px-6 pb-10">
                <p className="tpl-lead mx-auto max-w-md whitespace-pre-line">{message}</p>
              </section>
            </Reveal>
          )
        )}

        {when && (
          <Reveal>
            <section id="calendar" aria-label={v.dateLong} className="px-4 pb-14 text-center">
              <BrowseCalendar year={when.year} month={when.month} day={when.day} locale={locale} />
              <p className="tpl-eyebrow mt-5">{s("celebrateWithYou", locale)} ♡</p>
            </section>
          </Reveal>
        )}

        {v.main && (
          <Reveal>
            <section id="countdown" aria-labelledby="countdown-heading" lang={locale} className="px-4 pb-16 text-center text-[color:var(--navy)]">
              <p className="tpl-eyebrow">{s("countingDown", locale)}</p>
              <h2 id="countdown-heading" className="tpl-h2 mb-8 italic [&:lang(my)]:not-italic">
                {s("untilWeSay", locale)}
              </h2>
              <PlainCountdown variant="boxed" targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
            </section>
          </Reveal>
        )}

        <Reveal>
          <TplStory invitation={invitation} locale={locale} collage={split.story.length ? <PhotoCollage photos={split.story} locale={locale} art="dusk" layout="scatter" frame="plain" /> : null} />
        </Reveal>
        <div className="bg-[color:var(--paper)]">
          <Reveal>
            <Schedule invitation={invitation} locale={locale} variant="rows" />
          </Reveal>
        </div>

        {v.gallery.length > 0 && (
          <Reveal>
            <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
              <div className="tpl-wide">
                <h2 id="gallery-heading" className="tpl-h2 mb-10 uppercase [&:lang(my)]:normal-case">
                  {s("glimpseJourney", locale)}
                </h2>
                <PhotoCollage photos={split.rest} locale={locale} art="dusk" layout="scatter" frame="plain" />
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <Venue invitation={invitation} locale={locale} />
        </Reveal>

        {dress && (
          <Reveal>
            <section id="dress" aria-labelledby="dress-heading" lang={locale} className="tpl-section">
              <div className="tpl-wide">
                <h2 id="dress-heading" className="tpl-h2 mb-10 uppercase [&:lang(my)]:normal-case">
                  {s("dressHeading", locale)}
                </h2>
                <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
                  <div className="tpl-card text-center">
                    <p className="tpl-eyebrow !text-[color:var(--navy)]">{s("dressEyebrow", locale)}</p>
                    <p className="tpl-display mt-4 text-[1.2rem] leading-relaxed whitespace-pre-line text-[color:var(--navy)]">{t(dress.text, locale)}</p>
                  </div>
                  {dress.colors && dress.colors.length > 0 && (
                    <div className="tpl-card text-center">
                      <p className="tpl-eyebrow !text-[color:var(--navy)]">{s("ourPalette", locale)}</p>
                      <ul className="mt-5 flex flex-wrap justify-center gap-3">
                        {dress.colors.map((c) => (
                          <li key={c.hex} title={t(c.name, locale) || c.hex} className="flex flex-col items-center">
                            <span aria-hidden className="size-11 rounded-full border border-black/10" style={{ background: c.hex }} />
                            <span className="tpl-eyebrow mt-2 !text-[0.55rem] !tracking-[0.1em]">{t(c.name, locale) || c.hex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <TplRsvp invitation={invitation} locale={locale} token={token} />
        </Reveal>
        <Reveal><TplTips invitation={invitation} locale={locale} /></Reveal>
<Reveal><TplSeat invitation={invitation} locale={locale} /></Reveal>
<Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>
        <Reveal>
          <GiftSection invitation={invitation} locale={locale} plain />
        </Reveal>
        <Reveal>
          <WishesSection invitation={invitation} locale={locale} token={token} plain />
        </Reveal>
        </div>
        <ClosingQuote invitation={invitation} locale={locale} />
        <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
