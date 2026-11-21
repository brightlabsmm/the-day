import { splitPhotos } from "./split";
import { t, formatNumber } from "@/lib/i18n/numerals";
import { oneTime, zonedParts } from "@/lib/i18n/datetime";
import { s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { PhotoCollage } from "./collage";
import { OgeeFrame } from "./ogee-frame";
import { Peach, WildflowerBorder, WreathCaps } from "./wildflowers";
import { Reveal } from "./reveal";
import { TplFaq, TplSeat, TplTips, TplRsvp, TplStory, dressOf } from "./extras";
import { TrackOpen } from "./track-open";
import { navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Peach and olive: watercolour wildflowers around the names, scalloped frames for each section. */
export function WildflowerPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const split = splitPhotos(v.gallery);
  const { wedding } = invitation;
  const [m1, m2] = monogram.split("&");
  const message = t(wedding.invitation_text, locale);
  const date = v.main
    ? (() => {
        const p = zonedParts(v.main.starts_at, v.tz);
        return [p.day, p.month, p.year].map((n) => formatNumber(n, locale, 2)).join("·");
      })()
    : "";
  const place = v.venues[0] ? t(v.venues[0].venue_name, locale) : "";
  const dress = dressOf(invitation);

  return (
    <div className="tpl tpl-wildflower" lang={locale}>
      <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
      <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" />

      <header id="top" className="px-4 pt-20 pb-6">
        <div className="relative mx-auto w-[min(96vw,30rem)]" style={{ aspectRatio: "300 / 570" }}>
          <div className="wf-wreath absolute inset-0">
            <WildflowerBorder seed={5} height={570} />
            <WreathCaps seed={5} height={570} />
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <OgeeFrame className="wf-frame !w-[78%]">
              <p className="wf-line tpl-mono !text-[0.58rem]" style={{ "--i": 0 } as React.CSSProperties}>{s("theatreTogether", locale)}</p>
              <p aria-hidden className="wf-line mt-2 text-[0.8rem] text-[color:var(--gold)]" style={{ "--i": 1 } as React.CSSProperties}>♥ ♥ ♥</p>
              <p className="wf-line tpl-display mx-auto mt-3 max-w-[15rem] text-[1.05rem] leading-snug text-[color:var(--navy)]" style={{ "--i": 2 } as React.CSSProperties}>{s("pleasureOfCompany", locale)}</p>
              <h1 className="tpl-script mt-3 text-[clamp(2.6rem,12vw,3.6rem)] text-[color:var(--navy)]">
                <span className="wf-line block" style={{ "--i": 3 } as React.CSSProperties}>{v.names.one}</span>
                <span className="wf-line block text-[0.5em] text-[color:var(--gold)]" style={{ "--i": 4 } as React.CSSProperties}>&amp;</span>
                <span className="wf-line block" style={{ "--i": 5 } as React.CSSProperties}>{v.names.two}</span>
              </h1>
              {date && <p className="wf-line tpl-mono mt-4" style={{ "--i": 6 } as React.CSSProperties}>{date}</p>}
              {place && <p className="wf-line tpl-mono mt-2 !text-[0.58rem] !tracking-[0.14em]" style={{ "--i": 7 } as React.CSSProperties}>{place}</p>}
            </OgeeFrame>
          </div>
        </div>
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
        <Reveal>
          <OgeeFrame id="countdown" label={s("untilTheWedding", locale)} className="my-10">
            <p className="tpl-display text-[1rem] tracking-[0.3em] text-[color:var(--ink-soft)]">
              {m1} <span className="mx-1 inline-block h-3 w-px bg-[color:var(--gold)] align-middle" /> {m2}
            </p>
            <p className="tpl-script mt-2 text-[2.6rem] text-[color:var(--navy)]">{s("countdownScript", locale)}</p>
            <p className="tpl-mono mt-1">{s("untilTheWedding", locale)}</p>
            <div className="mt-5 text-[color:var(--navy)]">
              <PlainCountdown variant="compact" targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
            </div>
            <Peach className="mx-auto mt-5 h-16" />
          </OgeeFrame>
        </Reveal>
      )}

      <Reveal>
        <TplStory invitation={invitation} locale={locale} collage={split.story.length ? <PhotoCollage photos={split.story} locale={locale} art="bloom" layout="scatter" frame="white" /> : null} />
      </Reveal>

      {v.gallery.length > 0 && (
        <Reveal>
          <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
            <div className="tpl-narrow text-center">
              <h2 id="gallery-heading" className="tpl-script text-[clamp(2.6rem,8vw,3.8rem)] text-[color:var(--navy)]">
                {s("storyHeading", locale)}
              </h2>
              <p className="tpl-mono mt-2 mb-10">{s("momentsSubtitle", locale)}</p>
              <PhotoCollage photos={split.rest} locale={locale} art="bloom" layout="scatter" frame="white" />
            </div>
          </section>
        </Reveal>
      )}

      {invitation.events.length > 0 && (
        <Reveal>
          <OgeeFrame id="schedule" label={s("programHeading", locale)} className="my-10">
            <h2 className="tpl-script text-[2.1rem] leading-tight text-[color:var(--navy)]">{s("programHeading", locale)}</h2>
            <ol className="mt-5 space-y-4">
              {invitation.events.map((e) => (
                <li key={e.id}>
                  <p className="tpl-mono !text-[0.62rem]">{t(e.title, locale)}</p>
                  <p className="tpl-display text-[1.05rem] text-[color:var(--navy)]">{oneTime(e.starts_at, v.tz, locale)}</p>
                </li>
              ))}
            </ol>
          </OgeeFrame>
        </Reveal>
      )}

      {dress && (
        <Reveal>
          <OgeeFrame id="dress" label={s("dressHeading", locale)} className="my-10">
            <h2 className="tpl-script text-[2.3rem] text-[color:var(--navy)]">{s("dressHeading", locale)}</h2>
            {t(dress.text, locale) && <p className="tpl-mono mt-3 !tracking-[0.12em]">{t(dress.text, locale)}</p>}
            {dress.colors && dress.colors.length > 0 && (
              <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-3">
                {dress.colors.map((c) => (
                  <li key={c.hex} className="flex flex-col items-center">
                    <span aria-hidden className="size-9 rounded-full border border-black/10" style={{ background: c.hex }} />
                    <span className="tpl-mono mt-2 !text-[0.5rem] !tracking-[0.1em]">{t(c.name, locale) || c.hex}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="tpl-mono mt-6 !text-[0.55rem] !tracking-[0.14em]">{s("cannotWait", locale)}</p>
          </OgeeFrame>
        </Reveal>
      )}

      {v.venues.length > 0 && (
        <Reveal>
          <OgeeFrame id="venue" label={s("venueHeading", locale)} className="my-10">
            <h2 className="tpl-script text-[2.3rem] text-[color:var(--navy)]">{s("venueHeading", locale)}</h2>
            <p className="tpl-display mt-4 text-[1.2rem] leading-snug text-[color:var(--navy)]">{t(v.venues[0].venue_name, locale)}</p>
            {t(v.venues[0].venue_address, locale) && (
              <p className="tpl-mono mt-3 !text-[0.58rem] !tracking-[0.12em] whitespace-pre-line">{t(v.venues[0].venue_address, locale)}</p>
            )}
            {v.venues[0].map_url && (
              <a href={v.venues[0].map_url} target="_blank" rel="noopener noreferrer" className="tpl-btn mt-6 !px-5 !py-2.5">
                {s("directions", locale)} ↗<span className="sr-only"> {s("opensNewTab", locale)}</span>
              </a>
            )}
          </OgeeFrame>
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
      <ClosingQuote invitation={invitation} locale={locale} />

      <footer lang={locale} className="px-6 pt-6 pb-14 text-center">
        <p className="tpl-mono">{s("withLove", locale)}</p>
        <p className="tpl-script mt-2 text-[2.4rem] text-[color:var(--navy)]">
          {v.names.one} <span className="text-[color:var(--gold)]">&amp;</span> {v.names.two}
        </p>
        {date && <p className="tpl-mono mt-2">{date}</p>}
      </footer>
    </div>
  );
}
