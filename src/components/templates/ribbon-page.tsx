import Image from "next/image";
import { z } from "zod";
import type { AlbumPhoto } from "@/lib/album";
import { s, guestName } from "@/lib/i18n/strings";
import { GiftSection } from "@/components/invite/gift-section";
import { WishesSection } from "@/components/invite/wishes-section";
import { TemplateNav } from "./nav";
import { Reveal } from "./reveal";
import { TplRsvp } from "./extras";
import { Gate } from "./gate";
import { t } from "@/lib/i18n/numerals";
import { navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";
import { Bow, Car, Champagne, Church, Dancers, Glasses, PillOutline, Plate, Shoes } from "./ribbon-art";

const Faq = z.array(z.object({ q: z.object({ en: z.string().optional() }).partial(), a: z.object({ en: z.string().optional() }).partial() }));

/** The wording of this design lives in cover_text.ribbon, so a wedding can set every line of it. */
const Copy = z
  .object({
    intro: z.object({ title: z.string(), text: z.string() }),
    about: z.object({
      title: z.string(),
      sub: z.string(),
      items: z.array(z.object({ icon: z.enum(["church", "dancers", "shoes"]), title: z.string(), text: z.string() })),
    }),
    schedule: z.object({
      title: z.string(),
      items: z.array(z.object({ time: z.string(), title: z.string(), text: z.string().optional() })),
      note: z.string().optional(),
      noteBold: z.string().optional(),
      noteAfter: z.string().optional(),
    }),
    gift: z.object({ title: z.string(), line: z.string(), paragraphs: z.array(z.string()) }),
    faqTitle: z.string(),
    rsvpBy: z.string(),
    contact: z.array(z.object({ text: z.string(), href: z.string().optional() })),
  })
  .partial();

const ICONS = { church: Church, dancers: Dancers, shoes: Shoes } as const;
const PINK = "text-[#f7e1e6]";

/** Where the little sparkles float behind the cover (fixed values, so the page renders the same everywhere). */
const SPARKS = [
  { x: "8%", y: "26%", s: 14, d: "0s", t: "9s" },
  { x: "20%", y: "62%", s: 10, d: "2.5s", t: "8s" },
  { x: "33%", y: "14%", s: 12, d: "4s", t: "10s" },
  { x: "66%", y: "18%", s: 10, d: "1.2s", t: "9.5s" },
  { x: "79%", y: "58%", s: 16, d: "3.4s", t: "8.5s" },
  { x: "91%", y: "30%", s: 11, d: "5.2s", t: "10s" },
  { x: "52%", y: "78%", s: 9, d: "6s", t: "9s" },
];

/**
 * Blue Ribbon: light pink and cobalt blue with hand-drawn line art. A brush-script cover over a toast
 * of champagne glasses, a row of arched photos, a blue band with a wedding car, three illustrated
 * details, the schedule, the gift page with a QR in an arch, FAQ beside an arched photo, and a ribbon.
 * There is no opening screen.
 */
export function RibbonPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding } = invitation;
  const raw = (wedding.cover_text as Record<string, unknown> | null) ?? {};
  const copy = Copy.safeParse(raw.ribbon).data ?? {};
  const faq = (Faq.safeParse(wedding.faq).data ?? []).map((f) => ({ q: f.q.en ?? "", a: f.a.en ?? "" })).filter((f) => f.q);
  const tagline = (wedding.tagline as { en?: string } | null)?.en ?? "";
  const englishOnly = raw.english_only === true;

  const album = v.gallery;
  const pick = (i: number): AlbumPhoto | null => album[i] ?? (album.length ? album[i % album.length] : null) ?? v.cover;
  const arches = [pick(0), pick(1), pick(2)].filter((p): p is AlbumPhoto => !!p);
  const faqPhoto = pick(3);

  return (
    // Opening screen for this design; it also records when a guest with a personal link opens it.
    <Gate
      kind="ribbon"
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
    <div className="tpl tpl-ribbon" lang={locale}>
      <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" hideLang={englishOnly} />

      {/* 1 · Cover */}
      <header id="top" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center text-[color:var(--navy)]">
        {SPARKS.map((k, i) => (
          <svg key={i} aria-hidden viewBox="0 0 20 20" className="rb-drift pointer-events-none absolute text-[color:var(--navy)] opacity-0" style={{ left: k.x, top: k.y, width: k.s, height: k.s, "--d": k.d, "--t": k.t } as React.CSSProperties}>
            <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill="currentColor" />
          </svg>
        ))}
        <h1 className="rb-names relative text-[clamp(4.2rem,13vw,9.5rem)] leading-[0.95]">
          <span style={{ "--d": "250ms" } as React.CSSProperties} className="rb-write block -translate-x-[0.35em]">{v.names.one} &amp;</span>
          <span style={{ "--d": "1000ms" } as React.CSSProperties} className="rb-write block translate-x-[0.4em]">{v.names.two}</span>
        </h1>
        {tagline && (
          <p style={{ "--d": "500ms" } as React.CSSProperties} className="tpl-garden-rise mt-10 font-[family-name:var(--font-jost)] text-[0.72rem] tracking-[0.12em] uppercase sm:text-[0.85rem]">
            {tagline}
          </p>
        )}
        <div style={{ "--d": "900ms" } as React.CSSProperties} className="tpl-garden-rise mt-8 flex w-full max-w-3xl flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {wedding.rsvp_enabled && (
            <a href="#rsvp" className="rb-pill sm:order-1">
              <PillOutline />
              <span className="relative">RSVP</span>
            </a>
          )}
          <Glasses className="rb-float h-[7.5rem] w-auto sm:order-2 sm:h-[8.5rem]" />
          {v.hasGift && (
            <a href="#gift" className="rb-pill sm:order-3">
              <PillOutline />
              <span className="relative">Gift Registry</span>
            </a>
          )}
        </div>
      </header>

      {/* 2 · Arched photographs */}
      {arches.length > 0 && (
        <section id="gallery" aria-label={s("galleryHeading", locale)} className="px-6 pb-[clamp(3rem,7vw,5rem)]">
          <ul className="mx-auto flex max-w-4xl flex-wrap items-end justify-center gap-6 sm:flex-nowrap sm:gap-[7%]">
            {arches.map((p, i) => (
              <Reveal as="li" variant="arch" delay={i * 220} key={p.id} className="relative aspect-[0.55] w-[min(78%,16rem)] sm:w-[27%]">
                <div className="rb-arch absolute inset-0 overflow-hidden border border-[color:var(--navy)]">
                  <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 80vw, 280px" className="object-cover" />
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* 3 · Blue band with the wedding car */}
      {copy.intro && (
        <section id="invitation" aria-label={s("weddingInvitationLabel", locale)} className={`bg-[color:var(--navy)] px-6 py-[clamp(3.5rem,8vw,6rem)] ${PINK}`}>
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-6">
            <Reveal variant="left">
              <h2 className="rb-script rb-wipe text-[clamp(2rem,4.2vw,2.9rem)] leading-[1.15]">{copy.intro.title}</h2>
              <p className="rb-caps mt-8 max-w-[22rem] text-[0.86rem]">{copy.intro.text}</p>
            </Reveal>
            <Reveal variant="right" delay={150}>
              <Car className="rb-draw rb-drive mx-auto w-[min(100%,26rem)] md:ml-auto" />
            </Reveal>
          </div>
        </section>
      )}

      {/* 4 · About the wedding */}
      {copy.about && (
        <section id="venue" aria-label={copy.about.title} className="px-6 py-[clamp(4rem,9vw,7rem)] text-center text-[color:var(--navy)]">
          <Reveal>
            <h2 className="rb-script rb-wipe text-[clamp(2.3rem,5vw,3.4rem)]">{copy.about.title}</h2>
            <p className="rb-caps mt-3 text-[0.9rem]">{copy.about.sub}</p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-4xl gap-12 md:grid-cols-3 md:gap-8">
            {copy.about.items?.map((it, i) => {
              const Icon = ICONS[it.icon];
              return (
                <Reveal key={it.title} delay={i * 150} className={i === 1 ? "md:mt-20" : ""}>
                  <div id={it.icon === "shoes" ? "dress" : undefined}>
                    <Icon className={`rb-draw mx-auto h-28 w-auto ${it.icon === "dancers" ? "h-36" : ""}`} />
                    <h3 className="rb-caps mt-5 text-[1.05rem] font-bold">{it.title}</h3>
                    <p className="rb-caps mx-auto mt-3 max-w-[15rem] text-[0.8rem]">{it.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 5 · Schedule of events */}
      {copy.schedule && (
        <section id="schedule" aria-label={copy.schedule.title} className="relative px-6 pb-[clamp(4rem,9vw,7rem)] text-center text-[color:var(--navy)]">
          <Reveal variant="photo" delay={300} className="absolute top-0 right-[6%] hidden md:block"><Plate className="rb-draw h-24 w-auto" /></Reveal>
          <Reveal>
            <h2 className="rb-script rb-wipe text-[clamp(2.3rem,5vw,3.4rem)]">{copy.schedule.title}</h2>
          </Reveal>
          <div className="relative mx-auto mt-12 grid max-w-3xl gap-x-10 gap-y-12 sm:grid-cols-2">
            {copy.schedule.items?.map((e, i) => (
              <Reveal key={e.title} delay={(i % 2) * 150}>
                <div>
                  <p className="rb-caps text-[0.8rem]">{e.time}</p>
                  <h3 className="rb-caps mt-2 text-[1.25rem] font-bold">{e.title}</h3>
                  {e.text && <p className="rb-caps mx-auto mt-3 max-w-[18rem] text-[0.74rem]">{e.text}</p>}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="relative mx-auto mt-14 max-w-3xl">
            <Reveal variant="photo" delay={300} className="absolute -bottom-6 left-0 hidden -translate-x-[110%] md:block"><Champagne className="rb-draw h-28 w-auto" /></Reveal>
            {copy.schedule.note && (
              <p className="rb-caps text-[0.8rem]">
                {copy.schedule.note}
                {copy.schedule.noteBold ? <> <strong>{copy.schedule.noteBold}</strong></> : null}
                {copy.schedule.noteAfter ? ` ${copy.schedule.noteAfter}` : null}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 6 · Gift registry */}
      {v.hasGift && copy.gift && (
        <section id="gift" aria-label={s("giftHeading", locale)} className="px-6 py-[clamp(3rem,8vw,6rem)] text-[color:var(--navy)]">
          <Reveal>
            <div className="text-center">
              <h2 className="rb-script rb-wipe text-[clamp(2.4rem,5vw,3.6rem)] leading-tight">{copy.gift.title}</h2>
              <p className="rb-caps -mt-1 text-[0.9rem]">{copy.gift.line}</p>
            </div>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-3xl items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto]">
            <Reveal variant="left">
              <div className="space-y-6">
                {copy.gift.paragraphs?.map((p) => (
                  <p key={p} className="rb-caps max-w-[22rem] text-[0.8rem]">{p}</p>
                ))}
              </div>
            </Reveal>
            <Reveal variant="arch" delay={150}>
              <div className="rb-arch mx-auto grid h-[17rem] w-[15.5rem] place-items-center bg-[color:var(--navy)] pt-16 [&_ul]:justify-center">
                <GiftSection invitation={invitation} locale={locale} plain bare intro="" />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* The reply form behind the RSVP button */}
      <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} calendar={false} /></Reveal>

      {/* 7 · FAQ on blue */}
      {faq.length > 0 && (
        <section id="faq" aria-label={copy.faqTitle ?? s("faqHeading", locale)} className={`bg-[color:var(--navy)] px-6 py-[clamp(4rem,9vw,6.5rem)] ${PINK}`}>
          <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:gap-16">
            {faqPhoto && (
              <Reveal variant="arch">
                <div className="rb-arch relative mx-auto aspect-[0.55] w-[min(78%,15rem)] overflow-hidden border border-[#f7e1e6]/70 md:w-full">
                  <Image src={faqPhoto.src} alt={faqPhoto.alt} fill sizes="(max-width: 768px) 70vw, 260px" className="object-cover" />
                </div>
              </Reveal>
            )}
            <Reveal variant="right" delay={150}>
              <h2 className="rb-script rb-wipe text-[clamp(2.2rem,4.6vw,3.1rem)]">{copy.faqTitle ?? s("faqHeading", locale)}</h2>
              <dl className="mt-8 space-y-8">
                {faq.map((f) => (
                  <div key={f.q}>
                    <dt className="rb-caps text-[1.05rem] font-bold">{f.q}</dt>
                    <dd className="rb-caps mt-2 max-w-[30rem] text-[0.8rem]">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {/* Wishes, only when a wedding turns them on */}
      {v.showWishes && (
        <Reveal>
          <WishesSection invitation={invitation} locale={locale} token={token} plain />
        </Reveal>
      )}

      {/* 8 · RSVP by, and the ribbon */}
      <footer id="contact" lang={locale} className={`border-t border-[#f7e1e6]/30 bg-[color:var(--navy)] px-6 pt-[clamp(4rem,9vw,6rem)] pb-14 text-center ${PINK}`}>
        {copy.rsvpBy && (
          <Reveal>
            <h2 className="rb-script rb-wipe text-[clamp(2.2rem,6vw,4rem)]">{copy.rsvpBy}</h2>
          </Reveal>
        )}
        <Reveal variant="photo" delay={150}>
          <Bow className="rb-draw rb-sway mx-auto mt-10 h-[11rem] w-auto" />
        </Reveal>
        {copy.contact && copy.contact.length > 0 && (
          <Reveal delay={250}>
            <ul className="rb-caps mx-auto mt-16 flex max-w-4xl flex-col items-center justify-between gap-4 text-[0.95rem] sm:flex-row">
              {copy.contact.map((c) => (
                <li key={c.text}>
                  {c.href ? (
                    <a href={c.href} className="hover:underline">
                      {c.text}
                    </a>
                  ) : (
                    c.text
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </footer>
    </div>
    </Gate>
  );
}
