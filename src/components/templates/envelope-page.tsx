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
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { Reveal } from "./reveal";
import { TplDressCode, TplFaq, TplRsvp, TplStory } from "./extras";
import { TplFooter, TplGallery, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Cream envelope sealed with wax; inside, a soft page with script lettering. */
export function EnvelopePage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, guest } = invitation;
  const message = t(wedding.invitation_text, locale);

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
    >
      <div className="tpl tpl-envelope" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" />

        <header id="top" className="tpl-section pt-32 pb-8 text-center">
          <p className="tpl-eyebrow">{s("weddingInvitationLabel", locale)}</p>
          <h1 className="tpl-script mt-5 text-[clamp(3rem,11vw,6.5rem)] text-[color:var(--navy)]">
            {v.names.one}
            <span className="mx-[0.3em] text-[color:var(--gold)]">&amp;</span>
            {v.names.two}
          </h1>
          {v.dateLong && <p className="tpl-display mt-6 text-[1.25rem] italic text-[color:var(--ink-soft)]">{v.dateLong}</p>}
        </header>

        <section id={v.hasLineage ? undefined : "invitation"} aria-label={s("youreInvited", locale)} className="tpl-section pt-6">
          <div className="tpl-wide grid items-center gap-10 md:grid-cols-2 md:gap-16">
            {v.cover && (
              <figure className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden shadow-[0_24px_50px_-24px_rgba(79,62,49,.55)]">
                <Image src={v.cover.src} alt={v.cover.alt} fill priority sizes="(max-width: 768px) 90vw, 440px" className="object-cover" />
              </figure>
            )}
            <div className="text-center md:text-left">
              <p className="tpl-script text-[clamp(2.8rem,8vw,4.8rem)] text-[color:var(--navy)]">{s("youreInvited", locale)}</p>
              {message && !v.hasLineage && <p className="mt-6 text-[1.15rem] leading-[2.1] italic">{message}</p>}
              <hr className="my-7 border-[color:var(--navy)]/20" />
              <p className="tpl-display text-[1.2rem]">{v.dateLong}</p>
              <p className="mt-1 text-[0.95rem] text-[color:var(--ink-soft)]">{v.timeRange}</p>
            </div>
          </div>
        </section>

        {v.hasLineage && <InvitationMessage invitation={invitation} locale={locale} plain />}

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

        <Reveal><TplStory invitation={invitation} locale={locale} /></Reveal>

        <Reveal><Schedule invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplGallery photos={v.gallery} locale={locale} /></Reveal>
        <Reveal><Venue invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplDressCode invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} /></Reveal>
        <Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>
        <Reveal><GiftSection invitation={invitation} locale={locale} plain /></Reveal>
        <Reveal><WishesSection invitation={invitation} locale={locale} token={token} plain /></Reveal>
        <ClosingQuote invitation={invitation} locale={locale} />
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
