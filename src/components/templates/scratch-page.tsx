import Image from "next/image";
import { t } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { InvitationMessage } from "@/components/invite/invitation-message";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { ClosingQuote } from "@/components/invite/closing-quote";
import { Gate } from "./gate";
import { TemplateNav } from "./nav";
import { MonthCalendar } from "./calendar";
import { PlainCountdown } from "./plain-countdown";
import { Schedule } from "./schedule";
import { Venue } from "./venue";
import { TplFooter, TplGallery, navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Rose-pink, playful: scratch the heart to reveal, then calendar and hearts. */
export function ScratchPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, guest } = invitation;
  const message = t(wedding.invitation_text, locale);

  return (
    <Gate
      kind="scratch"
      slug={wedding.slug}
      token={guest ? token : null}
      locale={locale}
      monogram={monogram}
      coverSrc={v.cover?.src ?? null}
      guestLabel={guestName(guest, locale)}
      dateLabel={v.dateShort}
      onOpenAction={onOpenAction}
    >
      <div className="tpl tpl-scratch" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="dark" />

        <header id="top" className="relative grid min-h-[92svh] place-items-center overflow-hidden px-6 text-center text-white">
          {v.cover && <Image src={v.cover.src} alt="" fill priority sizes="100vw" className="object-cover" />}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#a93a55]/45 via-[#a93a55]/30 to-[#fff6f5]" />
          <div className="relative [text-shadow:0_2px_18px_rgba(120,30,55,.45)]">
            <p className="tpl-eyebrow !text-white">{s("weddingInvitationLabel", locale)}</p>
            <h1 className="mt-6 text-[clamp(2.8rem,10.5vw,6.5rem)] leading-[1.15] italic [&:lang(my)]:not-italic">
              {v.names.one}
              <span className="mx-[0.25em] text-[0.6em]">&amp;</span>
              {v.names.two}
            </h1>
            {v.dateLong && <p className="tpl-display mt-6 text-[1.2rem] tracking-[0.1em]">{v.dateLong}</p>}
          </div>
        </header>

        <section id={v.hasLineage ? undefined : "invitation"} aria-label={s("youreInvited", locale)} className="tpl-section">
          <div className="tpl-narrow text-center">
            <p className="tpl-orn">♡</p>
            <h2 className="tpl-h2 italic [&:lang(my)]:not-italic">{s("youreInvited", locale)}</h2>
            {message && !v.hasLineage && <p className="tpl-lead mx-auto mt-6 max-w-xl whitespace-pre-line">{message}</p>}
            {v.main && (
              <div className="mt-12">
                <MonthCalendar iso={v.main.starts_at} timeZone={v.tz} locale={locale} />
              </div>
            )}
          </div>
        </section>

        {v.hasLineage && <InvitationMessage invitation={invitation} locale={locale} plain />}

        {v.main && (
          <section aria-labelledby="countdown-heading" lang={locale} className="bg-[color:var(--paper)] px-4 py-[clamp(3.5rem,9vw,6rem)] text-center text-[color:var(--navy)]">
            <p id="countdown-heading" className="tpl-orn">
              ♡ <span className="tpl-eyebrow !text-[color:var(--gold-deep)]">{s("untilTheWedding", locale)}</span> ♡
            </p>
            <div className="mt-8">
              <PlainCountdown targetIso={v.main.starts_at} locale={locale} label={`${v.dateLong} · ${v.timeRange}`} />
            </div>
          </section>
        )}

        <Schedule invitation={invitation} locale={locale} />
        <TplGallery photos={v.gallery} locale={locale} />
        <Venue invitation={invitation} locale={locale} />
        <GiftSection invitation={invitation} locale={locale} plain />
        <WishesSection invitation={invitation} locale={locale} token={token} plain />
        <ClosingQuote invitation={invitation} locale={locale} />
        <p className="tpl-orn pb-2">♡ ♡ ♡</p>
        <TplFooter v={v} locale={locale} />
      </div>
    </Gate>
  );
}
