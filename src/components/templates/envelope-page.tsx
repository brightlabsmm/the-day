import { MapPin } from "lucide-react";
import { formatNumber, t } from "@/lib/i18n/numerals";
import { zonedParts } from "@/lib/i18n/datetime";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { togetherPhotos } from "@/lib/album";
import { PhotoCollage } from "./collage";
import { splitPhotos } from "./split";
import { Gate } from "./gate";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { Schedule } from "./schedule";
import { TplDressCode, TplFaq, TplSeat, TplTips, TplRsvp, TplStory, hasStory } from "./extras";
import { TplFooter, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";
import { InView, ScrollMotionRoot, Stagger, StaggerItem } from "./scroll-motion";
import { EnvelopeGallery, EnvelopeHero, EnvelopeLetter } from "./envelope-parts";

/**
 * Cream envelope sealed with wax; inside, a soft page with script lettering.
 * After the opening: an arched cover hero, a letter whose flap opens on
 * scroll, a combined "when & where" band, a drifting photo wall and the
 * guest sections, each moving in and back out with the scroll.
 */
export function EnvelopePage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, guest } = invitation;
  const message = t(wedding.invitation_text, locale);
  // Without a written story, every photo goes on the wall instead of a story collage.
  const story = hasStory(invitation);
  const together = togetherPhotos(v.gallery);
  const split = splitPhotos(together);
  const wall = story ? split.rest : together;
  const day = v.main ? zonedParts(v.main.starts_at, v.tz).day : null;
  const myanmarDate = v.main ? t(v.main.myanmar_date_text, locale) : "";

  return (
    <Gate
      kind="envelope"
      slug={wedding.slug}
      token={guest ? token : null}
      locale={locale}
      monogram={monogram}
      coverSrc={v.cover?.src ?? null}
      guestLabel={guestName(guest, locale)}
      dateLabel={v.dateShort}
      onOpenAction={onOpenAction}
      preview={preview}
    >
      <ScrollMotionRoot>
        <div className="tpl tpl-envelope" lang={locale}>
          <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" />

          <EnvelopeHero
            locale={locale}
            names={v.names}
            monogram={monogram}
            dateLong={v.dateLong}
            timeRange={v.timeRange}
            venue={v.venues[0] ? t(v.venues[0].venue_name, locale) : ""}
            cover={v.cover ? { src: v.cover.src, alt: v.cover.alt } : null}
          />


          {/* The letter: family lineage when written, otherwise the couple's invitation */}
          <EnvelopeLetter id={v.hasLineage ? undefined : "invitation"} monogram={monogram}>
            {v.hasLineage ? (
              <InvitationMessage invitation={invitation} locale={locale} plain />
            ) : (
              <>
                <p className={`tpl-script text-[color:var(--navy)] ${locale === "my" ? "text-[clamp(1.55rem,5vw,2.35rem)]" : "text-[clamp(2.6rem,8vw,4.2rem)]"}`}>{s("youreInvited", locale)}</p>
                {message && <p className={`mx-auto mt-5 max-w-lg text-[color:var(--ink)] italic ${locale === "my" ? "text-[0.95rem] leading-[1.9] not-italic" : "text-[1.15rem] leading-[2]"}`}>{message}</p>}
                <span className="mx-auto mt-7 block h-px w-20 bg-[color:var(--gold)]" aria-hidden />
                <p className="tpl-eyebrow mt-6">
                  {v.names.one} &amp; {v.names.two}
                </p>
              </>
            )}
          </EnvelopeLetter>

          {/* When & where, with the countdown */}
          {v.main && (
            <section aria-labelledby="when-heading" lang={locale} className="tpl-section bg-[color:var(--paper)]">
              <div className="mx-auto w-full max-w-5xl">
                <InView className="text-center" amount={0.5}>
                  <p className="tpl-eyebrow">{s("untilTheWedding", locale)}</p>
                  <h2 id="when-heading" className="sr-only">
                    {s("dateLabel", locale)} · {s("venueLabel", locale)}
                  </h2>
                  <div className="mt-6 text-[color:var(--navy)]">
                    <PlainCountdown targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
                  </div>
                </InView>

                <Stagger className="mt-12 grid gap-5 md:grid-cols-2" gap={0.15}>
                  <StaggerItem from="left" className="tpl-card flex flex-col items-center justify-center bg-[color:var(--ivory)] px-6 py-9 text-center">
                    <p className="tpl-eyebrow">{s("dateLabel", locale)}</p>
                    {day !== null && (
                      <p className="tpl-display mt-3 text-[clamp(4rem,12vw,5.5rem)] leading-none font-medium text-[color:var(--gold-deep)]" aria-hidden>
                        {formatNumber(day, locale, 2)}
                      </p>
                    )}
                    <p className={`tpl-display mt-3 text-[color:var(--navy)] ${locale === "my" ? "text-[1.05rem]" : "text-[1.35rem]"}`}>{v.dateLong}</p>
                    <p className={`mt-1 text-[color:var(--ink-soft)] ${locale === "my" ? "text-[0.9rem]" : ""}`}>{v.timeRange}</p>
                    {myanmarDate && <p className={`mt-3 text-[color:var(--ink-soft)] ${locale === "my" ? "text-[0.82rem]" : "text-[0.95rem]"}`}>{myanmarDate}</p>}
                  </StaggerItem>

                  <StaggerItem from="right" className="tpl-card bg-[color:var(--ivory)] px-6 py-9 text-center">
                    <div id="venue" className="scroll-mt-24">
                      <p className="tpl-eyebrow">{s("venueLabel", locale)}</p>
                      <MapPin className="mx-auto mt-4 size-7 text-[color:var(--gold)]" strokeWidth={1.4} aria-hidden />
                      <div className="mt-3 space-y-8">
                        {v.venues.map((e) => (
                          <div key={e.id}>
                            <p className={`tpl-display leading-snug text-[color:var(--navy)] ${locale === "my" ? "text-[1.15rem]" : "text-[1.6rem]"}`}>{t(e.venue_name, locale)}</p>
                            {t(e.venue_address, locale) && (
                              <p className="mx-auto mt-2 max-w-xs whitespace-pre-line text-[color:var(--ink-soft)]">{t(e.venue_address, locale)}</p>
                            )}
                            {e.map_url && (
                              <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="tpl-btn mt-6">
                                {s("directions", locale)}
                                <span className="sr-only"> {s("opensNewTab", locale)}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                </Stagger>
              </div>
            </section>
          )}

          {story && (
            <InView>
              <TplStory
                invitation={invitation}
                locale={locale}
                collage={split.story.length ? <PhotoCollage photos={split.story} locale={locale} art="bloom" layout="scatter" frame="white" /> : null}
              />
            </InView>
          )}

          <InView>
            <Schedule invitation={invitation} locale={locale} />
          </InView>
          <EnvelopeGallery photos={wall} locale={locale} />
          <InView>
            <TplDressCode invitation={invitation} locale={locale} />
          </InView>
          <InView>
            <TplRsvp invitation={invitation} locale={locale} token={token} />
          </InView>
          <InView>
            <TplTips invitation={invitation} locale={locale} />
          </InView>
          <InView>
            <TplSeat invitation={invitation} locale={locale} />
          </InView>
          <InView>
            <TplFaq invitation={invitation} locale={locale} />
          </InView>
          <InView>
            <GiftSection invitation={invitation} locale={locale} plain />
          </InView>
          <InView>
            <WishesSection invitation={invitation} locale={locale} token={token} plain />
          </InView>
          <InView amount={0.4}>
            <ClosingQuote invitation={invitation} locale={locale} />
            <TplFooter v={v} locale={locale} />
          </InView>
        </div>
      </ScrollMotionRoot>
    </Gate>
  );
}
