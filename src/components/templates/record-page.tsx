import { splitPhotos } from "./split";
import Image from "next/image";
import { z } from "zod";
import { t } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { mediaUrl } from "@/lib/media";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplDressCode, TplFaq, TplSeat, TplRsvp } from "./extras";
import { TrackOpen } from "./track-open";
import { RecordPlayer } from "./record-player";
import { StoryPlayer, type Chapter } from "./story-player";
import { TplFooter, TplGallery, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

const text = z.object({ my: z.string().optional(), en: z.string().optional() }).partial();
const Story = z.array(z.object({ label: text.optional(), title: text.optional(), text: text.optional() }));

/** Seaside blues: a spinning record plays the song, and the story plays track by track. */
export function RecordPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const split = splitPhotos(v.gallery);
  const { wedding } = invitation;
  const chapters: Chapter[] = (Story.safeParse(wedding.story).data ?? [])
    .map((c) => ({ label: t(c.label, locale), title: t(c.title, locale), text: t(c.text, locale) }))
    .filter((c) => c.title);
  const items = navItemsFor(v, invitation, locale);

  return (
    <div className="tpl tpl-record" lang={locale}>
      <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
      <TemplateNav locale={locale} monogram={monogram} items={items} over="light" />

      <header id="top" className="relative grid min-h-svh place-items-center overflow-hidden px-6 pt-20 pb-16 text-center">
        {v.cover && <Image src={v.cover.src} alt="" fill priority sizes="100vw" className="rec-photo object-cover" />}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.5)_38%,rgba(255,255,255,.14)_66%,rgba(245,250,252,.78))]" />
        <div aria-hidden className="rec-veil absolute inset-0 bg-white" />
        <div className="rec-text relative">
          <p className="tpl-eyebrow !text-[color:var(--navy)]">{s("recordIntro", locale)}</p>
          <div className="mt-8">
            <RecordPlayer
              src={wedding.music_path ? mediaUrl(wedding.music_path) : null}
              title={wedding.music_title}
              monogram={monogram}
              locale={locale}
              light
            />
          </div>
          <h1 className="tpl-brush mt-10 text-[clamp(2.6rem,10vw,6rem)] text-[color:var(--navy)]">
            {v.names.one}
            <span className="mx-[0.25em] text-[0.7em]">&amp;</span>
            {v.names.two}
          </h1>
          {v.dateLong && <p className="tpl-eyebrow mt-6 !text-[color:var(--navy)]">{v.dateLong}{v.timeRange ? ` · ${v.timeRange}` : ""}</p>}
          <p className="tpl-eyebrow mt-12 !text-[color:var(--ink-soft)]">{s("scrollJourney", locale)} ↓</p>
        </div>
      </header>

      <Reveal>
        <InvitationMessage invitation={invitation} locale={locale} plain />
      </Reveal>

      {v.main && (
        <section aria-labelledby="countdown-heading" lang={locale} className="bg-[color:var(--paper)] px-4 py-[clamp(3.5rem,9vw,6rem)] text-center text-[color:var(--navy)]">
          <p id="countdown-heading" className="tpl-eyebrow">
            {s("untilTheWedding", locale)}
          </p>
          <div className="mt-8">
            <PlainCountdown targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
          </div>
        </section>
      )}

      {chapters.length > 0 && (
        <section id="story" aria-labelledby="story-heading" lang={locale} className="tpl-section">
          <div className="tpl-wide">
            <p className="tpl-eyebrow">{s("storyEyebrow", locale)}</p>
            <h2 id="story-heading" className="tpl-h2 mb-12">
              {s("storyHeading", locale)}
            </h2>
            <Reveal>
              <StoryPlayer chapters={chapters} locale={locale} />
            </Reveal>
          </div>
        </section>
      )}

      <Reveal>
        <Schedule invitation={invitation} locale={locale} />
      </Reveal>
      <Reveal>
        <TplGallery photos={split.rest} locale={locale} collage={{ art: "sea", layout: "mosaic", frame: "white" }} />
      </Reveal>
      <Reveal>
        <Venue invitation={invitation} locale={locale} />
      </Reveal>
      <Reveal>
        <TplDressCode invitation={invitation} locale={locale} />
      </Reveal>
      <Reveal>
        <TplRsvp invitation={invitation} locale={locale} token={token} />
      </Reveal>
<Reveal><TplSeat invitation={invitation} locale={locale} /></Reveal>
<Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>
      <Reveal>
        <GiftSection invitation={invitation} locale={locale} plain />
      </Reveal>
      <Reveal>
        <WishesSection invitation={invitation} locale={locale} token={token} plain />
      </Reveal>
      <ClosingQuote invitation={invitation} locale={locale} />
      <TplFooter v={v} locale={locale} />
    </div>
  );
}
