import Image from "next/image";
import { t } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { PhotoCollage } from "./collage";
import { splitPhotos } from "./split";
import { Gate } from "./gate";
import { TemplateNav } from "./nav";
import { PlainCountdown } from "./plain-countdown";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplDressCode, TplFaq, TplSeat, TplRsvp, TplStory } from "./extras";
import { TplFooter, TplGallery, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Velvet curtains and a spotlit stage; the day follows in acts. */
export function TheatrePage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const split = splitPhotos(v.gallery);
  const { wedding, guest } = invitation;
  const message = t(wedding.invitation_text, locale);
  const place = v.venues[0] ? t(v.venues[0].venue_name, locale) : "";

  return (
    <Gate
      kind="theatre"
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
      <div className="tpl tpl-theatre" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="dark" />

        <header id="top" className="relative grid min-h-[92svh] place-items-center overflow-hidden bg-[#150a08] px-6 text-center text-[#f1e4c8]">
          {v.cover && <Image src={v.cover.src} alt="" fill priority sizes="100vw" className="object-cover opacity-35 sepia" />}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_40%,rgba(120,70,40,.35),rgba(14,7,5,.92))]" />
          <div className="relative">
            <p className="tpl-eyebrow !text-[#d9bf86]">{s("theatreTogether", locale)}</p>
            <h1 className="tpl-script mt-6 text-[clamp(3.2rem,12vw,7rem)] text-[#f4e7c9]">
              {v.names.one}
              <span className="block text-[0.45em] text-[#c9a45a]">&amp;</span>
              {v.names.two}
            </h1>
            <p className="tpl-eyebrow mt-8 !text-[#d9bf86]">{s("theatreInvite", locale)}</p>
            {v.dateLong && <p className="tpl-display mt-5 text-[1.2rem] tracking-[0.12em]">{v.dateLong}</p>}
            {place && <p className="tpl-eyebrow mt-2 !text-[#b9a47a]">{place}</p>}
          </div>
        </header>

        <section id={v.hasLineage ? undefined : "invitation"} aria-label={s("weddingInvitationLabel", locale)} className="tpl-section">
          <div className="tpl-narrow text-center">
            <p className="tpl-eyebrow">{s("weddingInvitationLabel", locale)}</p>
            <h2 className="tpl-script mt-3 text-[clamp(2.6rem,8vw,4rem)] text-[color:var(--navy)]">{s("youreInvited", locale)}</h2>
            {message && !v.hasLineage && <p className="tpl-lead mx-auto mt-6 max-w-xl whitespace-pre-line">{message}</p>}
          </div>
        </section>

        {v.hasLineage && <InvitationMessage invitation={invitation} locale={locale} plain />}

        {v.main && (
          <section aria-labelledby="countdown-heading" lang={locale} className="px-4 pb-[clamp(3.5rem,9vw,6rem)] text-center text-[color:var(--navy)]">
            <p id="countdown-heading" className="tpl-eyebrow mb-8">
              {s("untilTheWedding", locale)}
            </p>
            <PlainCountdown variant="cards" targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
          </section>
        )}

        <div className="bg-[color:var(--paper)]">
          <Reveal><TplStory invitation={invitation} locale={locale} collage={split.story.length ? <PhotoCollage photos={split.story} locale={locale} art="night" layout="stack" frame="plain" /> : null} /></Reveal>
          <Reveal><Schedule invitation={invitation} locale={locale} variant="acts" /></Reveal>
        </div>
        <Reveal><TplGallery photos={split.rest} locale={locale} collage={{ art: "night", layout: "stack", frame: "plain" }} /></Reveal>
        <Reveal><Venue invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplDressCode invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} /></Reveal>
<Reveal><TplSeat invitation={invitation} locale={locale} /></Reveal>
<Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>
        <Reveal><GiftSection invitation={invitation} locale={locale} plain /></Reveal>
        <Reveal><WishesSection invitation={invitation} locale={locale} token={token} plain /></Reveal>
        <ClosingQuote invitation={invitation} locale={locale} />
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
