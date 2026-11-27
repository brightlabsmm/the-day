import Image from "next/image";
import { z } from "zod";
import type { AlbumPhoto } from "@/lib/album";
import { mediaUrl } from "@/lib/media";
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
const Tips = z.array(z.object({ title: text.optional(), text: text.optional() }));
/** Paper cut-outs uploaded with the wedding (tape, torn paper, pressed flowers, old letters, a polaroid frame). */
const Art = z.record(z.string(), z.object({ p: z.string(), w: z.number(), h: z.number() }));
type ArtMap = z.infer<typeof Art>;
type CSS = React.CSSProperties;

/** A typewriter paragraph. */
const type = "text-[0.92rem] leading-[1.85] text-[color:var(--ink)] [&:lang(my)]:text-[0.95rem] [&:lang(my)]:leading-[2.1]";

/** A paper cut-out, placed by percentages inside a collage. Missing art is simply left out. */
function Cut({ art, k, style, className = "", pos }: { art: ArtMap; k: string; style: CSS; className?: string; pos?: string }) {
  const a = art[k];
  if (!a) return null;
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`} style={style}>
      <Image src={mediaUrl(a.p)} width={a.w} height={a.h} alt="" sizes="(max-width: 640px) 70vw, 420px" className="h-full w-full select-none" style={{ objectFit: pos ? "cover" : "fill", objectPosition: pos }} />
    </div>
  );
}

/** A photograph inside a collage. */
function Photo({ p, style, className = "", pos = "50% 50%" }: { p: AlbumPhoto | null; style: CSS; className?: string; pos?: string }) {
  if (!p) return null;
  return (
    <div className={`absolute overflow-hidden shadow-[0_10px_22px_-14px_rgba(60,40,20,.55)] ${className}`} style={style}>
      <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 70vw, 420px" className="object-cover" style={{ objectPosition: pos }} />
    </div>
  );
}

/** A photo in an instant-film frame. The frame's window is measured from the supplied artwork. */
function Polaroid({ art, p, style }: { art: ArtMap; p: AlbumPhoto | null; style: CSS }) {
  if (!p) return null;
  const frame = art.polaroid;
  return (
    <div className="absolute shadow-[0_12px_24px_-14px_rgba(60,40,20,.6)]" style={style}>
      {frame ? (
        <>
          <div className="absolute overflow-hidden" style={{ left: "5.2%", right: "5.2%", top: "7.2%", bottom: "20%" }}>
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 45vw, 260px" className="object-cover" />
          </div>
          <Image src={mediaUrl(frame.p)} width={frame.w} height={frame.h} alt="" aria-hidden sizes="(max-width: 640px) 45vw, 260px" className="pointer-events-none relative h-full w-full select-none" />
        </>
      ) : (
        <div className="h-full w-full bg-[#fbf9f5] p-[5%] pb-[20%]">
          <div className="relative h-full w-full overflow-hidden">
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 45vw, 260px" className="object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Love Letters: a sand-paper invitation in the spirit of a scrapbook of love letters. Tan typewriter
 * labels ("Save the date.", the place and date), the couple's names in tall rust capitals with a
 * handwritten "forever." across them, and three collages of photographs with tape, torn paper,
 * pressed flowers and old letters. The details follow in typewriter rows with rust rules, and the
 * page closes with a last collage and "forever.".
 */
export function LettersPage({ invitation, locale, monogram, token, onOpenAction, preview }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, events } = invitation;
  const my = locale === "my";
  const cover = (wedding.cover_text as Record<string, unknown> | null) ?? {};
  const art: ArtMap = Art.safeParse(cover.art).data ?? {};
  const englishOnly = cover.english_only === true;

  const message = t(wedding.invitation_text, locale);
  const closing = t(wedding.closing_quote, locale);
  const dress = dressOf(invitation);
  const tips = (Tips.safeParse(wedding.good_to_know).data ?? [])
    .map((x) => ({ title: t(x.title, locale), text: t(x.text, locale) }))
    .filter((x) => x.title || x.text);
  const venue = v.venues[0] ?? null;
  const place = venue ? t(venue.venue_name, locale) : "";
  const showSchedule = events.length > 0 && !isHidden(invitation, "schedule");
  const hasDetails = !!venue || !!dress || tips.length > 0;

  // Photos: the cover leads the first collage; the rest are spread so that, as far as the album
  // allows, no picture is used twice.
  const album = v.gallery;
  const pick = (i: number): AlbumPhoto | null => album[i] ?? (album.length ? album[i % album.length] : null) ?? v.cover;
  const hero = v.cover ?? pick(0);
  const [snapA, snapB, tall, small, last] = [pick(0), pick(1), pick(2), pick(3), pick(4)];

  // "VENSTON BAY. JULY 15." — the place and the day, on a strip of tan paper.
  const day =
    !my && v.main ? new Date(v.main.starts_at).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: v.tz }) : v.dateShort;
  const dateline = [place, day].filter(Boolean).map((x) => (my ? x : `${x}.`)).join(my ? " · " : " ");
  const cta = wedding.rsvp_enabled ? "#rsvp" : v.hasGift ? "#gift" : "#invitation";
  const ctaLabel = wedding.rsvp_enabled ? s("gardenRsvp", locale) : s("navGift", locale);

  return (
    // Opening screen for this design; it also records when a guest with a personal link opens it.
    <Gate
      kind="letters"
      slug={wedding.slug}
      token={invitation.guest ? token : null}
      locale={locale}
      monogram={monogram}
      coverSrc={v.cover?.src ?? null}
      guestLabel={guestName(invitation.guest, locale)}
      dateLabel={dateline || v.dateShort}
      names={v.names}
      place={place}
      onOpenAction={onOpenAction}
      preview={preview}
    >
      <div className="tpl tpl-letters overflow-x-clip" lang={locale}>
        <TemplateNav locale={locale} monogram={monogram} items={navItemsFor(v, invitation, locale)} over="light" hideLang={englishOnly} />

        {/* 1 · Save the date, the names, and the first collage */}
        <header id="top" className="lt-hero px-5 pt-24 pb-[clamp(3rem,8vw,5rem)] text-center sm:pt-28">
          <div className="lt-hero-text">
          <Reveal>
            <p className="lt-chip">{s("lettersSaveDate", locale)}</p>
          </Reveal>
          {dateline && (
            <Reveal delay={120}>
              <p className="lt-chip lt-chip-wide mt-3">{dateline}</p>
            </Reveal>
          )}
          <Reveal delay={240}>
            <h1 className={`lt-big mx-auto mt-[2.4rem] max-w-5xl whitespace-nowrap ${my ? "text-[clamp(2.2rem,9vw,4.4rem)] whitespace-normal" : "text-[clamp(4.5rem,27.8vw,12rem)]"}`}>
              {v.names.one} &amp; {v.names.two}
              {my ? "" : "."}
            </h1>
          </Reveal>
          <Reveal delay={480}>
            <p aria-hidden={!my} className={`lt-script relative mx-auto -rotate-[3deg] ${my ? "mt-3 text-[1.6rem]" : "-mt-[0.26em] pr-[0.2em] text-[clamp(4.2rem,21.5vw,9.5rem)]"}`}>
              {s("lettersForever", locale)}
            </p>
          </Reveal>
          <Reveal delay={650}>
            <a href={cta} className="lt-button mt-6">
              {ctaLabel}
            </a>
          </Reveal>
          </div>

          {/* Collage: an old love letter, torn rust paper, the cover photo, a polaroid and a pressed flower */}
          {hero && (
            <Reveal variant="photo" delay={150}>
              <div className="lt-collage relative mx-auto mt-4 aspect-[343/367] w-[min(91.5vw,30rem)]">
                <Cut art={art} k="love-letter" style={{ left: "19%", top: "0%", width: "64%", height: "64%" }} pos="0% 50%" />
                <Cut art={art} k="torn" style={{ left: "11.7%", top: "5.2%", width: "34.4%", height: "16.4%" }} />
                <Photo p={hero} style={{ left: "29.4%", top: "9.5%", width: "61.8%", height: "82.8%" }} pos="58% 50%" />
                <Polaroid art={art} p={snapA} style={{ left: "0%", top: "51%", width: "46.4%", aspectRatio: "800 / 636" }} />
                <Cut art={art} k="flower-white" className="lt-sway" style={{ left: "69%", top: "67.3%", width: "30.9%", aspectRatio: "726 / 800" }} />
              </div>
            </Reveal>
          )}
        </header>

        {/* 2 · The second collage, straight after the first, as in the published design: a polaroid, old letters, a tall photo held by clear tape */}
        {tall && (
          <div className="lt-sec2">
          <Reveal variant="photo">
            <div className="lt-collage relative mx-auto mb-[clamp(3rem,8vw,5rem)] aspect-[343/273] w-[min(91.5vw,30rem)]">
              <Cut art={art} k="letters" style={{ left: "12.5%", top: "41%", width: "33.2%", height: "34.8%" }} pos="50% 30%" />
              <Polaroid art={art} p={snapB} style={{ left: "0%", top: "17.2%", width: "41.7%", aspectRatio: "800 / 636" }} />
              <Photo p={small} style={{ left: "32%", top: "66%", width: "27.1%", height: "34%" }} />
              <Photo p={tall} style={{ left: "45.8%", top: "5.5%", width: "47.8%", height: "86%" }} pos="50% 35%" />
              <Cut art={art} k="tape-clear" style={{ left: "53%", top: "0%", width: "33%", aspectRatio: "800 / 217" }} />
              <Cut art={art} k="flower-yellow" className="lt-sway" style={{ left: "0%", top: "60.4%", width: "21.9%", aspectRatio: "756 / 800" }} />
            </div>
          </Reveal>
          </div>
        )}

        {/* 3 · The invitation, typed out */}
        {message && (
          <section id="invitation" aria-label={s("weddingInvitationLabel", locale)} lang={locale} className="px-6 pb-[clamp(3rem,8vw,5rem)]">
            <Reveal>
              <p className={`${type} mx-auto max-w-[32rem] text-center whitespace-pre-line`}>{message}</p>
            </Reveal>
            {v.year && (
              <Reveal delay={150} className="mt-8 text-center">
                <p className="lt-chip">
                  {v.names.one} &amp; {v.names.two} · {v.year}
                </p>
              </Reveal>
            )}
          </section>
        )}

        <Reveal>
          <TplStory invitation={invitation} locale={locale} />
        </Reveal>

        {/* 4 · The plan and the details, in typewriter rows */}
        {(showSchedule || hasDetails) && (
          <section aria-label={s("gardenProgram", locale)} lang={locale} className="px-6 py-[clamp(3rem,8vw,5rem)]">
            <div className={`mx-auto grid gap-16 ${showSchedule && hasDetails ? "max-w-5xl md:grid-cols-2 md:gap-20" : "max-w-xl"}`}>
              {showSchedule && (
                <div id="schedule">
                  <Reveal>
                    <h2 className="lt-big text-[clamp(3rem,12vw,5rem)]">{s("lettersPlan", locale)}</h2>
                  </Reveal>
                  <ol className="mt-8">
                    {events.map((e, i) => (
                      <Reveal as="li" key={e.id} delay={i * 90} className={`lt-rule grid items-baseline gap-4 py-4 ${my ? "grid-cols-[9rem_1fr]" : "grid-cols-[6.5rem_1fr]"}`}>
                        <span className="text-[0.95rem] text-[color:var(--navy)]">{oneTime(e.starts_at, v.tz, locale)}</span>
                        <span className={`${type} text-right`}>{t(e.title, locale)}</span>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              )}

              {hasDetails && (
                <div>
                  <Reveal>
                    <h2 className="lt-big text-[clamp(3rem,12vw,5rem)]">{s("lettersDetails", locale)}</h2>
                  </Reveal>
                  <div className="mt-8 space-y-0">
                    {venue && (
                      <Reveal className="lt-rule py-5">
                        <div id="venue">
                          <h3 className="text-[1.15rem] tracking-[0.12em] text-[color:var(--navy)] uppercase [&:lang(my)]:tracking-normal" style={{ fontFamily: "inherit" }}>
                            {s("gardenVenue", locale)}
                          </h3>
                          <p className={`${type} mt-2 whitespace-pre-line`}>{t(venue.venue_address, locale) || place}</p>
                          {venue.map_url && (
                            <a href={venue.map_url} target="_blank" rel="noopener noreferrer" className={`${type} mt-2 inline-block text-[color:var(--navy)] underline underline-offset-4`}>
                              {s("directions", locale)}
                              <span className="sr-only"> {s("opensNewTab", locale)}</span>
                            </a>
                          )}
                        </div>
                      </Reveal>
                    )}
                    {dress && (
                      <Reveal className="lt-rule py-5">
                        <div id="dress">
                          <h3 className="text-[1.15rem] tracking-[0.12em] text-[color:var(--navy)] uppercase [&:lang(my)]:tracking-normal" style={{ fontFamily: "inherit" }}>
                            {s("dressHeading", locale)}
                          </h3>
                          {t(dress.text, locale) && <p className={`${type} mt-2 whitespace-pre-line`}>{t(dress.text, locale)}</p>}
                          {dress.colors && dress.colors.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-3">
                              {dress.colors.map((c) => (
                                <li key={c.hex} className="flex items-center gap-2">
                                  <span aria-hidden className="size-5 rounded-full border border-[color:var(--ink)]/30" style={{ background: c.hex }} />
                                  <span className="text-[0.8rem] text-[color:var(--ink)]">{t(c.name, locale) || c.hex}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </Reveal>
                    )}
                    {tips.map((x, i) => (
                      <Reveal key={i} className="lt-rule py-5">
                        {x.title && (
                          <h3 className="text-[1.15rem] tracking-[0.12em] text-[color:var(--navy)] uppercase [&:lang(my)]:tracking-normal" style={{ fontFamily: "inherit" }}>
                            {x.title}
                          </h3>
                        )}
                        {x.text && <p className={`${type} mt-2 whitespace-pre-line`}>{x.text}</p>}
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5 · Gift */}
        {v.hasGift && (
          <section id="gift" aria-label={s("giftHeading", locale)} lang={locale} className="px-6 py-[clamp(3rem,8vw,5rem)]">
            <div className="mx-auto max-w-xl">
              <Reveal>
                <h2 className="lt-big text-[clamp(3rem,12vw,5rem)]">{s("lettersGift", locale)}</h2>
              </Reveal>
              <Reveal delay={150}>
                <div className="mt-6 [&_.card-body]:text-[0.92rem] [&_.card-body]:leading-[1.85]">
                  <GiftSection invitation={invitation} locale={locale} plain bare intro={t(wedding.note, locale) || undefined} />
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Replies, seating and questions, on the same sand paper */}
        <Reveal><TplRsvp invitation={invitation} locale={locale} token={token} calendar={false} /></Reveal>
        <Reveal><TplSeat invitation={invitation} locale={locale} /></Reveal>
        <Reveal><TplFaq invitation={invitation} locale={locale} /></Reveal>

        {/* 7 · Wishes, set like the published "QUESTIONS?" block, beside the last collage on wide screens */}
        <div className="lt-end">
        <div className="lt-end-wishes px-5 pt-[clamp(3rem,8vw,5rem)]">
          <div className="mx-auto max-w-xl">
            <WishesSection
              invitation={invitation}
              locale={locale}
              token={token}
              heading={
                <Reveal>
                  <h2 id="wishes-heading" className={`lt-big text-right ${my ? "text-[clamp(2.2rem,9vw,3.2rem)]" : "text-[clamp(4.5rem,25.5vw,10.5rem)]"}`}>
                    {s("lettersWishes", locale)}
                  </h2>
                  <span aria-hidden className="lt-brush -mt-[0.35rem] ml-[-1.5%] w-[97%]" />
                </Reveal>
              }
            />
          </div>
        </div>

        {/* 8 · The last collage: yellow striped paper, a photo, a pressed red flower and a strip of manuscript */}
        {last && (
          <Reveal variant="photo" className="lt-end-collage">
            <div className="lt-collage relative mx-auto mt-4 aspect-[345/334] w-[min(92vw,30rem)]">
              <div aria-hidden className="lt-stripes absolute" style={{ left: "62.9%", top: "0%", width: "37.1%", height: "37.7%" }} />
              <Cut art={art} k="manuscript" style={{ left: "23.2%", top: "79%", width: "69%", height: "21%" }} pos="50% 80%" />
              <Photo p={last} style={{ left: "0%", top: "9.3%", width: "87.5%", height: "81.1%" }} pos="50% 96%" />
              <Cut art={art} k="flower-red" className="lt-sway" style={{ left: "66.1%", top: "24.6%", width: "30.4%", aspectRatio: "800 / 726" }} />
              <Cut art={art} k="washi" style={{ left: "27%", top: "87.4%", width: "73%", aspectRatio: "1500 / 134" }} />
            </div>
          </Reveal>
        )}
        </div>

        <footer lang={locale} className="px-6 pt-[clamp(3rem,8vw,4.5rem)] pb-14 text-center">
          <p className={`lt-script ${my ? "text-[1.6rem]" : "text-[clamp(3rem,12vw,4.5rem)]"}`}>{s("lettersForever", locale)}</p>
          <p className="lt-chip mt-6">
            {v.names.one} &amp; {v.names.two}
            {v.year ? ` · ${v.year}` : ""}
          </p>
          {closing && <p className={`${type} mx-auto mt-6 max-w-md whitespace-pre-line opacity-85`}>&ldquo;{closing}&rdquo;</p>}
        </footer>
      </div>
    </Gate>
  );
}
