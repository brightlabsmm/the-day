import { t } from "@/lib/i18n/numerals";
import { zonedParts } from "@/lib/i18n/datetime";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { Flourish } from "@/components/ornaments";
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

/** Small paper lanterns bobbing along the top of the hero. */
function Lanterns() {
  const items: [number, number, number][] = [[10, 36, 22], [24, 12, 30], [40, 40, 18], [58, 10, 26], [74, 34, 32], [90, 14, 20]];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-20 h-28 sm:h-36">
      <style>{`@keyframes lbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@media (prefers-reduced-motion:reduce){.lbob{animation:none!important}}`}</style>
      {items.map(([x, y, w], i) => (
        <span
          key={i}
          className="lbob absolute block rounded-[42%_42%_38%_38%] shadow-[0_0_22px_5px_rgba(255,179,71,.45)]"
          style={{ left: `${x}%`, top: `${y}%`, width: w, height: Math.round(w * 1.3), background: "radial-gradient(circle at 50% 40%,#fff1c9,#ffb347 55%,#d9692e)", animation: `lbob ${3.5 + (i % 3)}s ${(i * 0.4).toFixed(1)}s ease-in-out infinite` }}
        />
      ))}
    </div>
  );
}

/** Dusk lanterns: tap the big lantern to let it go, then a calendar, countdown and glowing cards. */
export function LanternPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
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
      kind="lantern"
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
      <div className="tpl tpl-lantern" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" />

        <header id="top" className="relative grid min-h-svh place-items-center overflow-hidden px-6 pt-20 pb-16 text-center">
          <Lanterns />
          <div className="relative">
            <p className="tpl-display text-[1rem] tracking-[0.3em] text-[color:var(--ink-soft)]">
              {m1} <span className="mx-2 inline-block h-3.5 w-px bg-[color:var(--gold)] align-middle" /> {m2}
            </p>
            <Flourish className="mx-auto mt-4 text-[color:var(--gold)]" />
            <h1 className="tpl-display mt-8 text-[clamp(2.6rem,9vw,5rem)] leading-[1.1] tracking-[0.06em] text-[color:var(--navy)] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">
              {v.names.one}
              <span className="my-1 block text-[0.34em] tracking-normal text-[color:var(--ink-soft)] normal-case italic">{s("and", locale)}</span>
              {v.names.two}
            </h1>
            {v.dateLong && <p className="tpl-eyebrow mt-8 !text-[color:var(--navy)]">{v.dateShort}</p>}
            {place && <p className="tpl-eyebrow mt-1">{place}</p>}
            <a href={cta} className="tpl-pill mt-9">
              {s(invitation.wedding.rsvp_enabled ? "navRsvp" : "navSchedule", locale)} <span aria-hidden>→</span>
            </a>
          </div>
        </header>

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
            <section aria-label={v.dateLong} className="px-4 pb-14 text-center">
              <BrowseCalendar year={when.year} month={when.month} day={when.day} locale={locale} />
              <p className="tpl-eyebrow mt-5">{s("celebrateWithYou", locale)} ♡</p>
            </section>
          </Reveal>
        )}

        {v.main && (
          <Reveal>
            <section aria-labelledby="countdown-heading" lang={locale} className="px-4 pb-16 text-center text-[color:var(--navy)]">
              <p className="tpl-eyebrow">{s("countingDown", locale)}</p>
              <h2 id="countdown-heading" className="tpl-h2 mb-8 italic [&:lang(my)]:not-italic">
                {s("untilWeSay", locale)}
              </h2>
              <PlainCountdown variant="boxed" targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
            </section>
          </Reveal>
        )}

        <Reveal>
          <TplStory invitation={invitation} locale={locale} collage={split.story.length ? <PhotoCollage photos={split.story} locale={locale} art="dusk" layout="mosaic" frame="plain" /> : null} />
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
                <PhotoCollage photos={split.rest} locale={locale} art="dusk" layout="mosaic" frame="plain" />
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
        <Reveal>
          <TplTips invitation={invitation} locale={locale} />
<TplSeat invitation={invitation} locale={locale} />
<TplFaq invitation={invitation} locale={locale} />
        </Reveal>
        <Reveal>
          <GiftSection invitation={invitation} locale={locale} plain />
        </Reveal>
        <Reveal>
          <WishesSection invitation={invitation} locale={locale} token={token} plain />
        </Reveal>
        <ClosingQuote invitation={invitation} locale={locale} />
        <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
