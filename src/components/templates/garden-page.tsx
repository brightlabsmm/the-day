import Image from "next/image";
import { z } from "zod";
import type { AlbumPhoto } from "@/lib/album";
import { t } from "@/lib/i18n/numerals";
import { oneTime } from "@/lib/i18n/datetime";
import { s, guestName } from "@/lib/i18n/strings";
import { isHidden } from "@/lib/theme";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { TemplateNav } from "./nav";
import { Reveal } from "./reveal";
import { TplFaq, TplRsvp, TplSeat, TplStory, dressOf } from "./extras";
import { Gate } from "./gate";
import { navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

const text = z.object({ my: z.string().optional(), en: z.string().optional() }).partial();
const Contact = z.array(z.object({ text: z.string(), href: z.string().startsWith("https://").optional() }));
const Tips = z.array(z.object({ title: text.optional(), text: text.optional() }));

/** A typewriter-face paragraph, as in the reference. */
const mono = "tpl-garden-mono text-[0.8rem] leading-[1.95] tracking-[0.02em] [&:lang(my)]:text-[0.9rem] [&:lang(my)]:leading-[2.1] [&:lang(my)]:tracking-normal";

/**
 * Sepia garden: a quiet film-photo invitation. A full-screen sepia cover with script names and a
 * thin-outlined RSVP button, a taupe page in a typewriter face with serif capitals, the programme
 * beside the reception notes, a row of photos on a dark floral ground, the gift page, and a dark
 * closing. There is no opening screen.
 */
export function GardenPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, events } = invitation;
  const my = locale === "my";
  const message = t(wedding.invitation_text, locale);
  const closing = t(wedding.closing_quote, locale);
  const dress = dressOf(invitation);
  const tips = (Tips.safeParse(wedding.good_to_know).data ?? [])
    .map((x) => ({ title: t(x.title, locale), text: t(x.text, locale) }))
    .filter((x) => x.title || x.text);
  const venue = v.venues[0] ?? null;
  const showSchedule = events.length > 0 && !isHidden(invitation, "schedule");
  const startTime = v.main ? oneTime(v.main.starts_at, v.tz, locale) : "";
  const place = venue ? t(venue.venue_name, locale) : "";

  // Photos: the cover opens the page and sits behind the row of photos; the rest are spread out
  // so that, as far as the album allows, no picture is used twice.
  const album = v.gallery;
  const pick = (i: number): AlbumPhoto | null => album[i] ?? (album.length ? album[i % album.length] : null) ?? v.cover;
  const portrait = pick(0);
  const wide = pick(1);
  const row = [pick(2), pick(3), pick(4)].filter((p, i, all): p is AlbumPhoto => !!p && all.findIndex((q) => q?.id === p.id) === i);
  const giftPhoto = pick(5);

  const cta = wedding.rsvp_enabled ? "#rsvp" : v.hasGift ? "#gift" : "#top";
  const ctaLabel = wedding.rsvp_enabled ? s("gardenRsvp", locale) : s("navGift", locale);
  // The line beside the portrait: "Our love for gardens (and each other)" splits into its two halves.
  const tag = /^(.*?)\s*(\([^)]*\))\s*$/.exec(t(wedding.tagline, locale));
  const tagLeft = tag ? tag[1] : v.names.one;
  const tagRight = tag ? tag[2] : `(${s("and", locale)} ${v.names.two})`;
  const note = t(wedding.note, locale);
  const englishOnly = (wedding.cover_text as Record<string, unknown> | null)?.english_only === true;
  const contact = Contact.safeParse((wedding.cover_text as Record<string, unknown> | null)?.contact).data;
  const hasContact = !!contact?.length;
  const dateText =
    !my && v.main
      ? new Date(v.main.starts_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: v.tz })
      : v.dateShort;
  const contactPhoto = pick(6);

  return (
    // Opening screen for this design; it also records when a guest with a personal link opens it.
    <Gate
      kind="garden"
      slug={wedding.slug}
      token={invitation.guest ? token : null}
      locale={locale}
      monogram={monogram}
      coverSrc={v.cover?.src ?? null}
      guestLabel={guestName(invitation.guest, locale)}
      dateLabel={v.dateShort}
      names={v.names}
      place={v.venues[0] ? t(v.venues[0].venue_name, locale) : ""}
      onOpenAction={onOpenAction}
      preview={preview}
    >
    <div className="tpl tpl-garden" lang={locale}>
      <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="dark" hideLang={englishOnly} />

      {/* 1 · Cover */}
      <header id="top" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#2a241d] px-6 pt-20 pb-24 text-center text-[#f6efe0]">
        {v.cover && <Image src={v.cover.src} alt="" fill priority sizes="100vw" className="object-cover [object-position:50%_18%]" />}
        <div aria-hidden className="absolute inset-0 bg-[#1d1812]/45" />
        <div className="relative z-10">
          <h1 style={{ "--d": "150ms" } as React.CSSProperties} className={`tpl-garden-rise tpl-script ${my ? "text-[clamp(1.9rem,7vw,3.8rem)] leading-[1.7]" : "text-[clamp(2.8rem,9vw,6.6rem)] leading-[1.1]"}`}>
            <span className="inline-block">{v.names.one}</span>
            <span className={`mx-[0.25em] ${my ? "text-[0.8em]" : "text-[0.62em]"}`}>&amp;</span>
            <span className="inline-block">{v.names.two}</span>
          </h1>
          <p style={{ "--d": "550ms" } as React.CSSProperties} className={`tpl-garden-rise tpl-display mt-2 uppercase ${my ? "text-[1.15rem] tracking-[0.06em]" : "text-[clamp(1.1rem,3.4vw,1.7rem)] tracking-[0.2em]"}`}>{s("gardenAnnounce", locale)}</p>
          <a href={cta} style={{ "--d": "950ms" } as React.CSSProperties} className="tpl-garden-rise tpl-garden-button mt-10">
            {ctaLabel}
          </a>
        </div>
        <div className="tpl-garden-mono absolute inset-x-6 bottom-7 z-10 flex items-end justify-between gap-6 text-[0.6rem] leading-[1.7] tracking-[0.16em] uppercase sm:text-[0.72rem] [&:lang(my)]:text-[0.78rem] [&:lang(my)]:tracking-normal">
          <p className="text-left">
            {dateText}
            {startTime ? `, ${startTime}` : ""}
          </p>
          {place && <p className="text-right">{place}</p>}
        </div>
      </header>

      {/* 2 · Our love, around a small portrait */}
      <>
        <section id="invitation" aria-label={s("weddingInvitationLabel", locale)} lang={locale} className="bg-[color:var(--paper)] px-6 py-[clamp(4rem,9vw,7rem)]">
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-14">
            <Reveal variant="left" delay={250}>
              <p className="tpl-display text-center text-[clamp(1.3rem,3vw,1.8rem)] leading-snug tracking-[0.04em] text-[color:var(--ink)] uppercase md:text-right [&:lang(my)]:normal-case [&:lang(my)]:leading-[1.9]">
                {tagLeft}
              </p>
            </Reveal>
            {portrait && (
              <Reveal variant="photo">
                <div className="relative mx-auto aspect-[3/4] w-[min(14rem,60vw)] overflow-hidden md:w-[15rem]">
                  <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 768px) 60vw, 240px" className="object-cover" />
                </div>
              </Reveal>
            )}
            <Reveal variant="right" delay={250}>
              <p className="tpl-display text-center text-[clamp(1.3rem,3vw,1.8rem)] leading-snug tracking-[0.04em] text-[color:var(--ink)] uppercase md:text-left [&:lang(my)]:normal-case [&:lang(my)]:leading-[1.9]">
                {tagRight}
              </p>
            </Reveal>
          </div>
          {message && (
            <Reveal delay={150}>
              <p className={`${mono} mx-auto mt-12 max-w-[34rem] text-center whitespace-pre-line text-[color:var(--ink)]`}>{message}</p>
            </Reveal>
          )}
        </section>
      </>

      <Reveal>
        <TplStory invitation={invitation} locale={locale} />
      </Reveal>

      {/* 3 · A wide photograph */}
      {wide && (
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/8]">
          <Reveal variant="photo" className="absolute inset-0">
            <Image src={wide.src} alt={wide.alt} fill sizes="100vw" className="object-cover" />
          </Reveal>
        </div>
      )}

      {/* 4 · Programme and reception */}
      {(showSchedule || venue || dress || tips.length > 0) && (
        <section aria-label={s("gardenProgram", locale)} lang={locale} className="bg-[color:var(--paper)] px-6 py-[clamp(4rem,9vw,7rem)]">
          <div className={`mx-auto grid gap-16 ${showSchedule ? "max-w-5xl md:grid-cols-2 md:gap-20" : "max-w-xl"}`}>
            {showSchedule && (
              <Reveal>
                <div id="schedule">
                  <h2 className="tpl-display text-[clamp(1.6rem,3.4vw,2.2rem)] tracking-[0.06em] text-[color:var(--ink)] uppercase [&:lang(my)]:normal-case">{s("gardenProgram", locale)}</h2>
                  <ol className="mt-10">
                    {events.map((e) => (
                      <li key={e.id} className="grid grid-cols-[6.2rem_1fr] items-baseline gap-4 border-b border-[color:var(--ink)]/35 py-[1.15rem] first:pt-0">
                        <span className={`${mono} text-[0.78rem] text-[color:var(--ink)]`}>{oneTime(e.starts_at, v.tz, locale)}</span>
                        <span className={`${mono} text-[color:var(--ink)]`}>{t(e.title, locale)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            )}

            {(venue || dress || tips.length > 0) && (
              <Reveal delay={0.1}>
                <div>
                  <h2 className="tpl-display text-[clamp(1.6rem,3.4vw,2.2rem)] tracking-[0.06em] text-[color:var(--ink)] uppercase [&:lang(my)]:normal-case">{s("gardenReception", locale)}</h2>
                  <div className="mt-10 space-y-9">
                    {venue && (
                      <div id="venue">
                        <h3 className="tpl-display text-[1.15rem] text-[color:var(--ink)]">{s("gardenVenue", locale)}</h3>
                        <p className={`${mono} mt-3 whitespace-pre-line text-[color:var(--ink)]`}>{t(venue.venue_address, locale) || place}</p>
                        {venue.map_url && (
                          <a href={venue.map_url} target="_blank" rel="noopener noreferrer" className={`${mono} mt-3 inline-block text-[color:var(--ink)] underline underline-offset-4`}>
                            {s("directions", locale)}
                            <span className="sr-only"> {s("opensNewTab", locale)}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {dress && (
                      <div id="dress">
                        <h3 className="tpl-display text-[1.15rem] text-[color:var(--ink)]">{s("dressHeading", locale)}</h3>
                        {t(dress.text, locale) && <p className={`${mono} mt-3 whitespace-pre-line text-[color:var(--ink)]`}>{t(dress.text, locale)}</p>}
                        {dress.colors && dress.colors.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-3">
                            {dress.colors.map((c) => (
                              <li key={c.hex} className="flex items-center gap-2">
                                <span aria-hidden className="size-5 rounded-full border border-[color:var(--ink)]/30" style={{ background: c.hex }} />
                                <span className={`${mono} text-[0.72rem] text-[color:var(--ink)]`}>{t(c.name, locale) || c.hex}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {tips.length > 0 && (
                      <div>
                        <h3 className="tpl-display text-[1.15rem] text-[color:var(--ink)]">{s("gardenParking", locale)}</h3>
                        <div className="mt-3 space-y-4">
                          {tips.map((x, i) => (
                            <p key={i} className={`${mono} whitespace-pre-line text-[color:var(--ink)]`}>
                              {x.title && <strong className="font-medium">{x.title}</strong>}
                              {x.title && x.text ? " — " : ""}
                              {x.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* 5 · A row of photos on a dark floral ground */}
      {row.length > 0 && (
        <section id="gallery" aria-label={s("galleryHeading", locale)} className="relative isolate overflow-hidden bg-[#1f1a14] px-6 py-[clamp(4rem,9vw,7rem)]">
          {v.cover && <Image src={v.cover.src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-60 blur-[2px]" />}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[#14100b]/55" />
          <ul className="mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-5 sm:gap-8">
            {row.map((p, i) => (
              <Reveal as="li" variant="photo" delay={i * 180} key={p.id} className={`relative aspect-[3/4] w-[min(100%,15rem)] overflow-hidden sm:w-[calc((100%-4rem)/3)] ${i === 1 ? "sm:mt-12" : ""}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 80vw, 280px" className="object-cover" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* 6 · Gift */}
      {v.hasGift && (
        <>
          <section id="gift" aria-label={s("giftHeading", locale)} lang={locale} className="bg-[color:var(--paper)] px-6 py-[clamp(4rem,9vw,7rem)]">
            <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
              {giftPhoto && (
                <Reveal variant="photo">
                  <div className="relative mx-auto aspect-[3/4] w-[min(100%,20rem)] overflow-hidden md:w-full">
                    <Image src={giftPhoto.src} alt="" fill sizes="(max-width: 768px) 80vw, 380px" className="object-cover" />
                  </div>
                </Reveal>
              )}
              <Reveal variant="right" delay={200} className={giftPhoto ? "" : "md:col-span-2 md:mx-auto md:max-w-xl"}>
              <div>
                <h2 className="tpl-display text-[clamp(1.5rem,3.2vw,2rem)] leading-snug text-[color:var(--ink)] [&:lang(my)]:leading-[1.9]">{s("gardenGiftTitle", locale)}</h2>
                <div className="mt-6 [&_.card-body]:text-[0.8rem] [&_.card-body]:leading-[1.95]">
                  <GiftSection invitation={invitation} locale={locale} plain bare intro={note || undefined} />
                </div>
              </div>
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* Replies, seating, questions and wishes, in the same quiet taupe */}
      <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} calendar={false} /></Reveal>
      <Reveal><TplSeat invitation={invitation} locale={locale} /></Reveal>
      <Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>
      <Reveal>
        <WishesSection invitation={invitation} locale={locale} token={token} plain />
      </Reveal>

      {/* 7 · Closing */}
      {hasContact && contact ? (
        <footer id="contact" lang={locale} className="bg-[#2b2a26] px-6 pt-[clamp(4rem,9vw,6.5rem)] pb-12 text-center text-[#f3ecdd] [--navy:#f3ecdd] [--ink-soft:#cfc6b2]">
          <Reveal>
            <p className={`tpl-script ${my ? "text-[clamp(1.8rem,6vw,3rem)] leading-[1.8]" : "text-[clamp(3rem,10vw,6.4rem)] leading-[1.05]"}`}>{s("gardenContact", locale)}</p>
          </Reveal>
          {contactPhoto && (
            <Reveal variant="photo" delay={150}>
              <div className="relative mx-auto mt-10 aspect-[3/2] w-[min(100%,24rem)] overflow-hidden">
                <Image src={contactPhoto.src} alt="" fill sizes="(max-width: 640px) 90vw, 384px" className="object-cover" />
              </div>
            </Reveal>
          )}
          <Reveal delay={300}>
            <ul className="mx-auto mt-14 flex max-w-4xl flex-col items-center justify-between gap-5 text-[1.05rem] sm:flex-row sm:text-[1.15rem]">
              {contact.map((c) => (
                <li key={c.text} className="tpl-display">
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {c.text}
                      <span className="sr-only"> {s("opensNewTab", locale)}</span>
                    </a>
                  ) : (
                    c.text
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </footer>
      ) : (
        <footer lang={locale} className="bg-[#2b2a26] px-6 pt-[clamp(4rem,9vw,6.5rem)] pb-12 text-center text-[#f3ecdd] [--navy:#f3ecdd] [--ink-soft:#cfc6b2]">
        <p className={`tpl-script ${my ? "text-[clamp(1.8rem,6vw,3rem)] leading-[1.8]" : "text-[clamp(3rem,10vw,6.4rem)] leading-[1.05]"}`}>{s("gardenThanks", locale)}</p>
        <p className="tpl-garden-mono mt-8 text-[0.7rem] tracking-[0.2em] uppercase opacity-90 [&:lang(my)]:text-[0.85rem] [&:lang(my)]:tracking-normal">
          {v.names.one} &amp; {v.names.two}
          {v.year ? ` · ${v.year}` : ""}
        </p>
        {closing && <p className={`${mono} mx-auto mt-6 max-w-md whitespace-pre-line opacity-80`}>&ldquo;{closing}&rdquo;</p>}
        </footer>
      )}
    </div>
    </Gate>
  );
}
