import Image from "next/image";
import { z } from "zod";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n/numerals";
import { oneTime, zonedParts } from "@/lib/i18n/datetime";
import { s, guestName } from "@/lib/i18n/strings";
import { isHidden } from "@/lib/theme";
import { WishesSection } from "@/components/invite/wishes-section";
import { TemplateNav } from "./nav";
import { Reveal } from "./reveal";
import { RsvpForm } from "./rsvp-form";
import { PhotoGrid } from "./photo-grid";
import { PlainCountdown } from "./plain-countdown";
import { TrackOpen } from "./track-open";
import { navItemsFor } from "./sections";
import { viewOf, type TemplateProps } from "./view";

/** Painted pieces uploaded with the invitation: `corner` roses, the photo `wreath` (with its gold rings) and the `watercolor` wash. */
const Art = z.record(z.string(), z.object({ p: z.string(), w: z.number(), h: z.number() }));
type ArtMap = z.infer<typeof Art>;
type CSS = React.CSSProperties;

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** A painted piece, placed by percentages of the card. Missing art is simply left out. */
function Paint({ art, k, style, className = "", flip = "" }: { art: ArtMap; k: string; style?: CSS; className?: string; flip?: "" | "x" | "y" | "xy" }) {
  const a = art[k];
  if (!a) return null;
  const scale = flip === "x" ? "-scale-x-100" : flip === "y" ? "-scale-y-100" : flip === "xy" ? "-scale-x-100 -scale-y-100" : "";
  const local = a.p.startsWith("/"); // served by this app (the /dev/bloom preview); anything else is in storage
  return (
    <div aria-hidden className={`pointer-events-none absolute select-none ${className}`} style={style}>
      <Image src={local ? a.p : mediaUrl(a.p)} unoptimized={local} width={a.w} height={a.h} alt="" sizes="(max-width: 640px) 50vw, 300px" className={`h-auto w-full ${scale}`} />
    </div>
  );
}

/**
 * The four rose corners. The painted piece is a top-right cluster; the card mirrors it for the other
 * corners, larger at the top than at the bottom, exactly as on the printed card.
 */
function Corners({ art, top = 38, bottom = 31.5 }: { art: ArtMap; top?: number; bottom?: number }) {
  return (
    <>
      <Paint art={art} k="corner" flip="x" className="bl-sway top-0 left-0" style={{ width: `${top}%` }} />
      <Paint art={art} k="corner" className="bl-sway bl-sway-r top-0 right-0" style={{ width: `${top}%` }} />
      <Paint art={art} k="corner" flip="xy" className="bl-sway bl-sway-b bottom-0 left-0" style={{ width: `${bottom}%` }} />
      <Paint art={art} k="corner" flip="y" className="bl-sway bl-sway-br right-0 bottom-0" style={{ width: `${bottom}%` }} />
    </>
  );
}

/** A small gold star, placed by percentages of the card. */
function Star({ style }: { style: CSS }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="bl-star pointer-events-none absolute" style={style}>
      <path d="M12 2.2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16.3l-5.8 3.5 1.6-6.5L2.7 8.9l6.7-.5z" />
    </svg>
  );
}

/** A centred section heading in the brush script of the name. */
function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 id={id} className="bl-name-font bl-h2">
        {children}
      </h2>
    </Reveal>
  );
}

/**
 * Watercolour Bloom: a little one's birthday card, laid out like the published Canva card it follows
 * (a 780 × 1096 card, everything placed by percentages so it scales with the screen): roses in the
 * four corners, "You are invited to" arched over a round photo in a eucalyptus wreath with fine gold
 * rings, the name in a brush script ("Sacha's"), "1st Birthday" in a fine tall script, the date and
 * place in a rounded handwriting, and a brown "RSVP" pill. Three gold stars twinkle around it.
 * Below the card, the same paper carries the countdown, the party, photos, the reply and wishes.
 */
export function BloomPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, events } = invitation;
  const my = locale === "my";
  const cover = (wedding.cover_text as Record<string, unknown> | null) ?? {};
  const art: ArtMap = Art.safeParse(cover.art).data ?? {};
  const englishOnly = cover.english_only === true;
  const contact = typeof cover.rsvp_contact === "string" ? cover.rsvp_contact.trim() : "";

  const name = v.names.one;
  // "Sacha's" in English; Burmese shows the name alone.
  const display = my ? name : name ? `${name}${/s$/i.test(name) ? "’" : "’s"}` : "";
  const invited = t(cover.script as never, locale) || s("bloomInvited", locale);
  const message = t(wedding.invitation_text, locale);
  const closing = t(wedding.closing_quote, locale);
  const venue = v.venues[0] ?? null;
  const address = venue ? t(venue.venue_address, locale) || t(venue.venue_name, locale) : "";
  // "15 june, 2030 at 3:00 pm", in lower case like the card.
  let when = "";
  if (v.main) {
    if (my) when = `${v.dateLong} ${oneTime(v.main.starts_at, v.tz, locale)}`;
    else {
      const d = zonedParts(v.main.starts_at, v.tz);
      when = `${d.day} ${MONTHS[d.month - 1]}, ${d.year} at ${oneTime(v.main.starts_at, v.tz, "en").toLowerCase()}`;
    }
  }
  const showSchedule = events.length > 0 && !isHidden(invitation, "schedule");
  const pillHref = wedding.rsvp_enabled ? "#rsvp" : contact ? `tel:${contact.replace(/[^\d+]/g, "")}` : "#schedule";
  const pill = contact ? `${my ? "ပြန်ကြားရန်" : "RSVP at"} ${contact}` : wedding.rsvp_enabled ? "RSVP" : s("bloomParty", locale);
  // Only link to sections this design has: no venue (it is in the party), dress code, seats, gifts or questions.
  const OWN = new Set(["invitation", "schedule", "gallery", "rsvp", "wishes"]);
  const nav = navItemsFor(v, invitation, locale).filter((x) => OWN.has(x.id));

  return (
    <div className="tpl tpl-bloom overflow-x-clip" lang={locale}>
      <TrackOpen slug={wedding.slug} token={invitation.guest ? token : null} action={onOpenAction} />
      <TemplateNav locale={locale} monogram={monogram} items={nav} over="light" hideLang={englishOnly} />

      {/* 1 · The card, element by element as on the Canva card */}
      <header id="invitation" className="bl-canvas relative mx-auto overflow-hidden">
        <Paint art={art} k="watercolor" className="inset-0 [&_img]:h-full [&_img]:object-cover" />
        <Corners art={art} />

        {/* "You are invited to", arched over the photo */}
        <svg viewBox="0 0 600 160" aria-hidden className="absolute" style={{ left: "20%", top: "5.6%", width: "60%" }}>
          <path id="bl-arch" d="M 90 150 A 400 400 0 0 1 510 150" fill="none" />
          <text className="bl-arch-text" textAnchor="middle">
            <textPath href="#bl-arch" startOffset="50%">
              {invited}
            </textPath>
          </text>
        </svg>
        <p className="sr-only">{invited}</p>

        {/* The photo in its wreath; without the painted wreath, a drawn gold ring stands in */}
        <div className="absolute overflow-hidden rounded-full bg-[#efe3dc]" style={{ left: "26.2%", width: "44%", aspectRatio: "1", top: "14.2%" }}>
          {v.cover && <Image src={v.cover.src} alt={v.cover.alt} fill priority sizes="(max-width: 640px) 42vw, 240px" className="object-cover" />}
        </div>
        {art.wreath ? (
          <Paint art={art} k="wreath" style={{ left: "25%", width: "50.6%", top: "13.8%" }} />
        ) : (
          <div aria-hidden className="bl-ring absolute rounded-full" style={{ left: "26.5%", width: "47%", aspectRatio: "1", top: "13%" }} />
        )}

        <Star style={{ left: "7.6%", top: "40.2%", width: "7.6%" }} />
        <Star style={{ left: "74.6%", top: "15.4%", width: "6.6%" }} />
        <Star style={{ left: "85.2%", top: "66.6%", width: "5.4%" }} />

        <div className="absolute inset-x-0 text-center" style={{ top: my ? "46%" : "47.6%" }}>
          <h1 className="bl-name-font bl-name">{display}</h1>
          {v.birthday && <p className={`bl-age ${my ? "bl-name-font" : "bl-script-font"}`}>{v.birthday}</p>}
        </div>

        <div className="absolute inset-x-0 px-[8%] text-center" style={{ top: "78.2%" }}>
          {when && <p className="bl-hand-font bl-when">{when}</p>}
          {address && <p className="bl-hand-font bl-where">{address}</p>}
        </div>
        <a href={pillHref} className="bl-hand-font bl-pill absolute left-1/2 -translate-x-1/2" style={{ top: "88.2%" }}>
          {pill}
        </a>
      </header>

      {/* 2 · The message and the countdown */}
      {(message || v.main) && (
        <section aria-label={s("navInvitation", locale)} className="bl-section">
          {message && (
            <Reveal>
              <p className="bl-text mx-auto max-w-md whitespace-pre-line">{message}</p>
            </Reveal>
          )}
          {v.main && (
            <Reveal delay={120} className="mt-10">
              <p className="bl-hand-font text-[1.3rem]">{s("bloomCountdown", locale)}</p>
              <div className="bl-count mt-3">
                <PlainCountdown targetIso={v.main.starts_at} locale={locale} label={v.dateLong} readable />
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* 3 · The party: each part of the day on its own little card */}
      {showSchedule && (
        <section id="schedule" aria-labelledby="party-heading" className="bl-section">
          <Heading id="party-heading">{s("bloomParty", locale)}</Heading>
          <ol className="mx-auto mt-8 grid max-w-md gap-4">
            {events.map((e, i) => (
              <Reveal as="li" key={e.id} delay={i * 90} className="bl-note">
                <p className="bl-hand-font text-[1.45rem]">{oneTime(e.starts_at, v.tz, locale)}</p>
                <p className="bl-text mt-1">{t(e.title, locale)}</p>
                {t(e.venue_name, locale) && <p className="bl-small mt-2">{t(e.venue_name, locale)}</p>}
                {t(e.venue_address, locale) && <p className="bl-small whitespace-pre-line">{t(e.venue_address, locale)}</p>}
                {e.map_url && (
                  <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="bl-small mt-2 inline-block underline underline-offset-4">
                    {s("directions", locale)}
                    <span className="sr-only"> {s("opensNewTab", locale)}</span>
                  </a>
                )}
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {/* 4 · Photos */}
      {v.gallery.length > 0 && (
        <section id="gallery" aria-labelledby="gallery-heading" className="bl-section">
          <Heading id="gallery-heading">{s("bloomMoments", locale)}</Heading>
          <div className="mx-auto mt-8 max-w-3xl">
            <PhotoGrid photos={v.gallery} locale={locale} />
          </div>
        </section>
      )}

      {/* 5 · The reply, on a smaller card with the same roses */}
      {wedding.rsvp_enabled && (
        <section id="rsvp" aria-labelledby="rsvp-heading" className="bl-section">
          <div className="bl-card relative mx-auto max-w-[34rem] overflow-hidden px-6 py-16">
            <Paint art={art} k="watercolor" className="inset-0 [&_img]:h-full [&_img]:object-cover" />
            <Corners art={art} top={26} bottom={22} />
            <div className="relative">
              <Heading id="rsvp-heading">{s("bloomRsvp", locale)}</Heading>
              <Reveal delay={120}>
                <p className="bl-text mx-auto mt-3 max-w-sm">{s("bloomRsvpIntro", locale)}</p>
                <div className="bl-form">
                  <RsvpForm slug={wedding.slug} token={invitation.guest ? token : null} locale={locale} defaultName={invitation.guest ? guestName(invitation.guest, locale) : ""} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* 6 · Wishes */}
      <div className="bl-section bl-wishes">
        <div className="mx-auto max-w-xl">
          <WishesSection invitation={invitation} locale={locale} token={token} heading={<Heading id="wishes-heading">{s("bloomWishes", locale)}</Heading>} intro={s("bloomWishesIntro", locale)} />
        </div>
      </div>

      {/* 7 · A last little card */}
      <footer lang={locale} className="bl-section pb-14">
        <div className="bl-card relative mx-auto max-w-[34rem] overflow-hidden px-6 pt-20 pb-20 text-center">
          <Paint art={art} k="watercolor" className="inset-0 [&_img]:h-full [&_img]:object-cover" />
          <Corners art={art} top={30} bottom={24} />
          <div className="relative">
            <p className="bl-name-font text-[clamp(2.2rem,9vw,3rem)] leading-tight [&:lang(my)]:text-[1.5rem]">{s("bloomThanks", locale)}</p>
            {closing && <p className="bl-text mx-auto mt-4 max-w-sm whitespace-pre-line">&ldquo;{closing}&rdquo;</p>}
            <p className="bl-hand-font mt-5 text-[1.2rem]">
              {name}
              {v.year ? ` · ${v.year}` : ""}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
