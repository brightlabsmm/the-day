import Image from "next/image";
import { z } from "zod";
import type { AlbumPhoto } from "@/lib/album";
import { mediaUrl } from "@/lib/media";
import { oneTime } from "@/lib/i18n/datetime";
import { Reveal } from "./reveal";
import { TplRsvp } from "./extras";
import { TrackOpen } from "./track-open";
import { viewOf, type TemplateProps } from "./view";

const Faq = z.array(z.object({ q: z.object({ en: z.string().optional() }).partial(), a: z.object({ en: z.string().optional() }).partial() }));
const Art = z.record(z.string(), z.object({ p: z.string(), w: z.number(), h: z.number() }));

/** The wording of this design lives in cover_text.renewal, and its flower artwork in cover_text.art. */
const Copy = z
  .object({
    kicker: z.string(),
    love: z.object({ script: z.string(), text: z.string() }),
    about: z.object({ lead: z.string(), script: z.string(), cards: z.array(z.object({ title: z.string(), text: z.string() })) }),
    program: z.object({ script: z.string(), lead: z.string(), date: z.string() }),
    faqTitle: z.string(),
    rsvp: z.object({
      title: z.string(),
      sub: z.string(),
      people: z.array(z.object({ name: z.string(), role: z.string(), address: z.string(), mobile: z.string(), email: z.string(), flower: z.string() })),
    }),
  })
  .partial();

type ArtMap = z.infer<typeof Art>;

/** A painted flower from this wedding's artwork; nothing is drawn when the wedding has none. */
function Flower({ art, k, className = "", style, sway }: { art: ArtMap; k: string; className?: string; style?: React.CSSProperties; sway?: { r?: string; t?: string; d?: string } }) {
  const a = art[k];
  if (!a) return null;
  return (
    <Image
      src={mediaUrl(a.p)}
      width={a.w}
      height={a.h}
      alt=""
      sizes="320px"
      className={`pointer-events-none select-none ${sway ? "rn-sway" : ""} ${className}`}
      style={{ ...style, ...(sway ? ({ "--r": sway.r, "--t": sway.t, "--d": sway.d } as React.CSSProperties) : {}) }}
    />
  );
}

const CARD = "border border-[#a3a283] px-6 py-7 text-center";
const BODY = "text-[1.12rem] leading-[1.3] text-[color:var(--ink-soft)]";

/**
 * Golden Renewal: olive green and cream with painted flowers. A monogram entwined with a tulip, a
 * green panel with the names, oval photographs with flowers laid over them, bordered detail cards,
 * the program inside an arch, numbered FAQs and coordinator cards. There is no opening screen.
 */
export function RenewalPage({ invitation, locale, monogram, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding, events } = invitation;
  const raw = (wedding.cover_text as Record<string, unknown> | null) ?? {};
  const copy = Copy.safeParse(raw.renewal).data ?? {};
  const art = Art.safeParse(raw.art).data ?? {};
  const faq = (Faq.safeParse(wedding.faq).data ?? []).map((f) => ({ q: f.q.en ?? "", a: f.a.en ?? "" })).filter((f) => f.q);
  const tagline = (wedding.tagline as { en?: string } | null)?.en ?? "";
  const [m1, m2] = monogram.split("&");

  const album = v.gallery;
  const pick = (i: number): AlbumPhoto | null => album[i] ?? (album.length ? album[i % album.length] : null) ?? v.cover;
  const ovals = [pick(0), pick(1), pick(2)].filter((p): p is AlbumPhoto => !!p);
  const tall = pick(3);

  return (
    <div className="tpl tpl-renewal" lang={locale}>
      <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />

      {/* 1 · The monogram and the tulip */}
      <header id="top" className="px-4 pt-6">
        <div className="relative mx-auto h-[22rem] w-[min(100%,23.5rem)] text-[color:var(--navy)]">
          <Reveal className="absolute top-[5%] left-[19%]">
            <span className="rn-thin block text-[9.2rem] leading-none">{m1}</span>
          </Reveal>
          <Reveal delay={200} className="absolute top-[47%] left-[53%]">
            <span className="rn-thin block text-[9.2rem] leading-none">{m2}</span>
          </Reveal>
          <Reveal variant="photo" delay={100} className="absolute top-[3%] left-[22%] w-[57%]">
            <Flower art={art} k="tulip" className="h-auto w-full -scale-x-100" sway={{ r: "1.6deg", t: "8s" }} />
          </Reveal>
        </div>
      </header>

      {/* 2 · The names, in a green panel */}
      <section aria-label={`${v.names.one} & ${v.names.two}`} className="mx-4 bg-[color:var(--navy)] px-6 pt-[clamp(5rem,12vw,7.5rem)] pb-16 text-center text-[#f7efd9] sm:mx-auto sm:max-w-[38rem]">
        {copy.kicker && (
          <Reveal>
            <p className="rn-script text-[2.3rem]">{copy.kicker}</p>
          </Reveal>
        )}
        <Reveal delay={150}>
          <h1 className="rn-thin mt-2 text-[clamp(3.9rem,15vw,5.2rem)]">
            {v.names.one} &amp;
            <br />
            {v.names.two}
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <hr className="mx-auto mt-8 w-14 border-t-2 border-[#f7efd9]" />
          {tagline && <p className="mx-auto mt-7 max-w-[15rem] text-[1.3rem] leading-[1.35]">{tagline}</p>}
        </Reveal>
      </section>

      {/* 3 · Love that transcends time, with oval photographs */}
      {copy.love && (
        <section id="gallery" aria-label={copy.love.script} className="bg-[color:var(--navy)] px-4 pt-[clamp(1rem,3vw,2rem)] pb-24 text-center text-[#f7efd9]">
          <Reveal>
            <p className="rn-script text-[3.2rem]">{copy.love.script}</p>
            <h2 className="rn-thin mx-auto mt-1 max-w-[17rem] text-[3.4rem]">{copy.love.text}</h2>
          </Reveal>
          <ul className="mx-auto mt-14 flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-10">
            {ovals.map((p, i) => (
              <Reveal as="li" variant="photo" delay={i * 150} key={`${p.id}-${i}`} className={`relative w-[min(78%,15.5rem)] ${i === 1 ? "md:mt-16" : ""}`}>
                <div className="relative aspect-[0.7] overflow-hidden rounded-[999px]">
                  <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 70vw, 248px" className={`object-cover ${i === 2 ? "object-[50%_85%]" : i === 1 ? "object-[50%_30%]" : "object-[50%_20%]"}`} />
                </div>
                {i === 0 && <Flower art={art} k="rose" className="absolute -top-4 -left-8 w-[34%]" style={{ rotate: "6deg" }} sway={{ r: "-3deg", t: "6.5s" }} />}
                {i === 1 && <Flower art={art} k="pansy" className="absolute top-[4%] -left-8 w-[27%]" sway={{ r: "3deg", t: "7.5s", d: "0.6s" }} />}
                {i === 2 && <Flower art={art} k="lily" className="absolute -right-6 bottom-[2%] w-[36%]" style={{ rotate: "-8deg" }} sway={{ r: "2.5deg", t: "7s", d: "1s" }} />}
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* 4 · About the ceremony */}
      {copy.about && (
        <section id="venue" aria-label={`${copy.about.lead} ${copy.about.script}`} className="px-4 pt-[clamp(4.5rem,10vw,6.5rem)] pb-16 text-center text-[color:var(--navy)]">
          <Reveal>
            <h2 className="rn-thin text-[clamp(3.6rem,13vw,4.6rem)]">{copy.about.lead}</h2>
            <p className="rn-script -mt-1 text-[clamp(3.4rem,12vw,4.4rem)]">{copy.about.script}</p>
          </Reveal>
          <div className="relative mx-auto mt-6 h-[19.5rem] w-[16rem]">
            <Reveal variant="photo" delay={100} className="absolute top-0 left-[8.2rem] w-[6.4rem]">
              <Flower art={art} k="anthurium-red" className="h-auto w-full" sway={{ r: "-2deg", t: "7.5s" }} />
            </Reveal>
            <Reveal variant="photo" className="absolute top-[7rem] left-0 w-[7.9rem]">
              <Flower art={art} k="anthurium-pink" className="h-auto w-full" sway={{ r: "2.4deg", t: "6.5s", d: "0.5s" }} />
            </Reveal>
          </div>
          <div className="mx-auto mt-8 grid max-w-[22rem] gap-5 md:max-w-5xl md:grid-cols-3">
            {copy.about.cards?.map((c, i) => (
              <Reveal key={c.title} delay={i * 120}>
                <div id={c.title.toLowerCase().includes("dress") ? "dress" : undefined} className={`${CARD} h-full`}>
                  <h3 className="rn-caps text-[1.12rem]">{c.title}</h3>
                  <p className={`${BODY} mt-2`}>{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 5 · Flowers, then the program in an arch */}
      <div aria-hidden className="relative mx-auto -mb-16 h-[26rem] w-[min(100%,23.5rem)]">
        <Reveal variant="photo" className="absolute top-[3%] left-[12%] w-[27%]">
          <Flower art={art} k="dahlia" className="h-auto w-full -scale-x-100" sway={{ r: "-2.4deg", t: "8s" }} />
        </Reveal>
        <Reveal variant="photo" delay={150} className="absolute top-[18%] left-[27%] w-[68%]">
          <Flower art={art} k="orchid" className="h-auto w-full" sway={{ r: "1.6deg", t: "9s", d: "0.4s" }} />
        </Reveal>
      </div>
      {copy.program && (
        <section id="schedule" aria-label={`${copy.program.script} ${copy.program.lead}`} className="relative mx-4 sm:mx-auto sm:max-w-[26rem]">
          <Reveal variant="arch">
            <div className="rounded-t-[999px] bg-[color:var(--navy)] px-8 pt-24 pb-14 text-center text-[#f7efd9]">
              <p className="rn-script text-[3.1rem]">{copy.program.script}</p>
              <h2 className="rn-thin -mt-1 text-[3.4rem]">{copy.program.lead}</h2>
              <p className="rn-caps mt-3 text-[1.06rem]">{copy.program.date}</p>
              <ul className="mt-5 border-b border-[#f7efd9]/35 text-left">
                {events.map((e) => (
                  <li key={e.id} className="flex items-baseline gap-5 border-t border-[#f7efd9]/35 py-3.5">
                    <span className="rn-caps w-[4.6rem] shrink-0 text-[0.98rem]">{oneTime(e.starts_at, v.tz, locale)}</span>
                    <span className="text-[1.25rem]">{(e.title as { en?: string }).en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>
      )}
      <div aria-hidden className="relative mx-auto -mt-1 h-[34rem] w-[min(100%,23.5rem)]">
        <Reveal variant="photo" className="absolute top-[4%] left-[19%] w-[56%] -scale-y-100">
          <Flower art={art} k="orchid" className="h-auto w-full" sway={{ r: "1.4deg", t: "9s" }} />
        </Reveal>
        <Reveal variant="photo" delay={150} className="absolute top-[7%] right-[9%] w-[27%]">
          <Flower art={art} k="dahlia" className="h-auto w-full" sway={{ r: "2.4deg", t: "8s", d: "0.4s" }} />
        </Reveal>
      </div>

      {/* 6 · FAQs on green */}
      {faq.length > 0 && (
        <section id="faq" aria-label={copy.faqTitle ?? "FAQs"} className="bg-[color:var(--navy)] px-4 pt-14 pb-12 text-[#f7efd9]">
          <div className="mx-auto max-w-[34rem]">
            <Reveal>
              <h2 className="rn-thin border-b border-[#f7efd9]/40 pb-1 text-center text-[4.6rem]">{copy.faqTitle ?? "FAQs"}</h2>
            </Reveal>
            <ol className="mt-1">
              {faq.map((f, i) => (
                <Reveal as="li" key={f.q} delay={i * 80} className={`py-5 ${i < faq.length - 1 ? "border-b border-[#f7efd9]/40" : ""}`}>
                  <span className="rn-thin block text-[3.1rem]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="rn-caps mt-1 text-[1.12rem] leading-snug">{f.q}</h3>
                  <p className="mt-3 text-[1.1rem] leading-[1.35]">{f.a}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 7 · A last photograph with a lily */}
      {tall && (
        <section aria-hidden className="bg-[color:var(--navy)] pb-14">
          <Reveal variant="photo" className="relative mx-auto ml-[4.2rem] mr-4 max-w-[26rem] sm:mx-auto">
            <div className="relative aspect-[0.5] w-full overflow-hidden">
              <Image src={tall.src} alt="" fill sizes="(max-width: 640px) 80vw, 416px" className="object-cover object-[50%_25%]" />
            </div>
            <Flower art={art} k="lily" className="absolute top-[3%] -left-[3.4rem] w-[4.6rem]" sway={{ r: "-3deg", t: "7s" }} />
          </Reveal>
        </section>
      )}

      {/* 8 · Please RSVP, with the coordinators */}
      {copy.rsvp && (
        <section id="coordinators" aria-label={copy.rsvp.title} className="px-4 pt-14 pb-20 text-center text-[color:var(--navy)]">
          <Reveal variant="photo">
            <div className="relative mx-auto h-16 w-40">
              {art.rose && (
                <Image src={mediaUrl(art.rose.p)} width={art.rose.w} height={art.rose.h} alt="" sizes="160px" className="absolute h-40 w-16 max-w-none" style={{ left: 48, top: -48, transform: "rotate(-90deg)" }} />
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="rn-thin text-[clamp(3.8rem,14vw,5rem)]">{copy.rsvp.title}</h2>
            <p className="rn-caps mx-auto mt-3 max-w-[22rem] text-[1.1rem] leading-snug">{copy.rsvp.sub}</p>
          </Reveal>
          <div className="mx-auto mt-8 grid max-w-[22rem] gap-5 md:max-w-3xl md:grid-cols-2">
            {copy.rsvp.people?.map((p, i) => (
              <Reveal key={p.name} delay={i * 150}>
                <div className={`${CARD} h-full`}>
                  <Flower art={art} k={p.flower} className={`mx-auto ${p.flower === "magnolia" ? "w-[4.4rem]" : "w-[6.6rem]"} h-auto`} sway={{ r: "2deg", t: "8s", d: `${i * 0.7}s` }} />
                  <p className="rn-script mt-3 text-[3rem]">{p.name}</p>
                  <p className="rn-caps text-[1.12rem]">{p.role}</p>
                  <p className={`${BODY} mt-5`}>{p.address}</p>
                  <p className={BODY}>{p.mobile}</p>
                  <p className={BODY}>{p.email}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      {/* Guests can also reply here */}
      {wedding.rsvp_enabled && (
        <Reveal>
          <TplRsvp invitation={invitation} locale={locale} token={token} calendar={false} />
        </Reveal>
      )}
    </div>
  );
}
