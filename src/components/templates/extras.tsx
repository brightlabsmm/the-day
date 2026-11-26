import { z } from "zod";
import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { FaqList } from "./faq";
import { FindSeat } from "./find-seat";
import { Reveal } from "./reveal";
import { RsvpForm } from "./rsvp-form";

const text = z.object({ my: z.string().optional(), en: z.string().optional() }).partial();
const Story = z.array(z.object({ label: text.optional(), title: text.optional(), text: text.optional() }));
const Faq = z.array(z.object({ q: text.optional(), a: text.optional() }));
const Dress = z.object({
  text: text.optional(),
  colors: z.array(z.object({ hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), name: text.optional() })).optional(),
});

function Head({ id, eyebrow, heading }: { id: string; eyebrow: string; heading: string }) {
  return (
    <>
      <p className="tpl-eyebrow">{eyebrow}</p>
      <h2 id={id} className="tpl-h2">
        {heading}
      </h2>
    </>
  );
}

/** The parsed dress code, or null when none is set. */
export function dressOf(i: Invitation) {
  return hasDress(i) ? Dress.parse(i.wedding.dress_code) : null;
}

export const hasStory = (i: Invitation) => (Story.safeParse(i.wedding.story).data?.length ?? 0) > 0;
export const hasSeat = (i: Invitation) => i.wedding.seating_enabled;
export const hasFaq = (i: Invitation) => (Faq.safeParse(i.wedding.faq).data?.length ?? 0) > 0;
export const hasDress = (i: Invitation) => {
  const d = Dress.safeParse(i.wedding.dress_code).data;
  return !!(d && (d.colors?.length || t(d.text, "en") || t(d.text, "my")));
};

/** "Our story": dated chapters down the page. */
export function TplStory({ invitation, locale, collage }: { invitation: Invitation; locale: Locale; collage?: React.ReactNode }) {
  const items = Story.safeParse(invitation.wedding.story).data ?? [];
  if (items.length === 0) return null;
  return (
    <section id="story" aria-labelledby="story-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow">
        <Head id="story-heading" eyebrow={s("storyEyebrow", locale)} heading={s("storyHeading", locale)} />
        {collage && <div className="mt-12">{collage}</div>}
        <ol className="mt-12 space-y-12">
          {items.map((it, i) => (
            <li key={i}>
              <Reveal>
                <div className="text-center">
                  {t(it.label, locale) && <p className="tpl-eyebrow !text-[color:var(--gold-deep)]">{t(it.label, locale)}</p>}
                  <h3 className={`tpl-display mt-2 leading-snug text-[color:var(--navy)] ${locale === "my" ? "text-[1.1rem]" : "text-[1.6rem]"}`}>{t(it.title, locale)}</h3>
                  <p className="mx-auto mt-3 max-w-lg leading-[2] whitespace-pre-line text-[color:var(--ink-soft)]">{t(it.text, locale)}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Dress code with colour swatches. */
export function TplDressCode({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  if (!hasDress(invitation)) return null;
  const d = Dress.parse(invitation.wedding.dress_code);
  return (
    <section id="dress" aria-labelledby="dress-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow text-center">
        <Head id="dress-heading" eyebrow={s("dressEyebrow", locale)} heading={s("dressHeading", locale)} />
        {t(d.text, locale) && <p className="tpl-lead mx-auto mt-6 max-w-xl whitespace-pre-line">{t(d.text, locale)}</p>}
        {d.colors && d.colors.length > 0 && (
          <ul className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-5">
            {d.colors.map((c) => (
              <li key={c.hex} className="flex w-20 flex-col items-center">
                <span aria-hidden className="size-14 rounded-full border border-black/10 shadow-inner" style={{ background: c.hex }} />
                <span className="tpl-eyebrow mt-3 !text-[0.62rem] !tracking-[0.16em]">{t(c.name, locale) || c.hex}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Calendar buttons for the main event. */
function CalendarLinks({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const e = invitation.events.find((x) => x.kind === "ceremony") ?? invitation.events[0];
  if (!e) return null;
  const compact = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = e.ends_at ?? new Date(Date.parse(e.starts_at) + 2 * 3600_000).toISOString();
  const names = `${t(invitation.wedding.partner_one_name, locale)} & ${t(invitation.wedding.partner_two_name, locale)}`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: names,
    dates: `${compact(e.starts_at)}/${compact(end)}`,
    location: [t(e.venue_name, locale), t(e.venue_address, locale)].filter(Boolean).join(", "),
  });
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <a href={`https://calendar.google.com/calendar/render?${q}`} target="_blank" rel="noopener noreferrer" className="tpl-btn">
        {s("addToCalendar", locale)}
        <span className="sr-only"> {s("opensNewTab", locale)}</span>
      </a>
      <a href={`/w/${invitation.wedding.slug}/calendar`} className="tpl-btn" download>
        {s("downloadIcs", locale)}
      </a>
    </div>
  );
}

/** RSVP form plus calendar buttons. */
export function TplRsvp({ invitation, locale, token, calendar = true }: { invitation: Invitation; locale: Locale; token: string | null; calendar?: boolean }) {
  const { wedding, guest } = invitation;
  if (!wedding.rsvp_enabled) return null;
  return (
    <section id="rsvp" aria-labelledby="rsvp-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow text-center">
        <Head id="rsvp-heading" eyebrow={s("rsvpEyebrow", locale)} heading={s("rsvpHeading", locale)} />
        <p className="tpl-lead mx-auto mt-5 max-w-md">{s("rsvpIntro", locale)}</p>
        <RsvpForm slug={wedding.slug} token={guest ? token : null} locale={locale} defaultName={guest ? guestName(guest, locale) : ""} />
        {calendar && <CalendarLinks invitation={invitation} locale={locale} />}
      </div>
    </section>
  );
}

/** Frequently asked questions. */
export function TplFaq({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const items = (Faq.safeParse(invitation.wedding.faq).data ?? [])
    .map((f) => ({ q: t(f.q, locale), a: t(f.a, locale) }))
    .filter((f) => f.q);
  if (items.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow">
        <div className="text-center">
          <Head id="faq-heading" eyebrow={s("faqEyebrow", locale)} heading={s("faqHeading", locale)} />
        </div>
        <div className="mt-10">
          <FaqList items={items} />
        </div>
      </div>
    </section>
  );
}

/** "Find your seat": guests search their name to see their table. */
export function TplSeat({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  if (!hasSeat(invitation)) return null;
  return (
    <section id="seat" aria-labelledby="seat-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow text-center">
        <Head id="seat-heading" eyebrow={s("seatEyebrow", locale)} heading={s("seatHeading", locale)} />
        <div className="mt-8">
          <FindSeat slug={invitation.wedding.slug} locale={locale} />
        </div>
      </div>
    </section>
  );
}
