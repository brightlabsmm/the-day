/* eslint-disable @next/next/no-img-element -- small pre-cropped static pictures */
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import type { CSSProperties, ElementType, ReactNode } from "react";
import "./landing.css";
import { Reveal } from "@/components/templates/reveal";
import { LandingNav } from "@/components/landing-nav";
import { CurrentYear } from "@/components/current-year";
import { fmt, startingPrice } from "@/lib/pricing";
import { TemplateCarousel, type TemplateCard } from "@/components/landing-carousel";
import { FACEBOOK_URL } from "@/components/site-chrome";

type V = "up" | "left" | "right" | "photo" | "drift" | "zoom";

/** A piece placed on the 1366×768 canvas (desktop) that simply stacks on phones and tablets. */
function B({
  x, y, w, h, fs, m, lh, cls = "", v = "up", delay, as, children,
}: {
  x: number; y: number; w?: number; h?: number; fs?: number; m?: string; lh?: number;
  cls?: string; v?: V; delay?: number; as?: ElementType; children?: ReactNode;
}) {
  const style = { "--x": x, "--y": y, "--w": w, "--h": h, "--fs": fs, "--m": m, "--lh": lh } as CSSProperties;
  return (
    <Reveal as={as} variant={v} delay={delay} className={`p ${fs ? "t" : ""} ${cls}`} style={style}>
      {children}
    </Reveal>
  );
}

/** A piece of the devices group, placed on its own 660×415 canvas. */
function D({ x, y, w, h, r, b, r2, cls = "", children }: { x: number; y: number; w: number; h: number; r?: number; b?: number; r2?: number; cls?: string; children?: ReactNode }) {
  return (
    <div className={`dv ${cls}`} style={{ "--x": x, "--y": y, "--w": w, "--h": h, "--r": r, "--b": b, "--r2": r2 } as CSSProperties}>
      {children}
    </div>
  );
}

/** True once public/landing/<name>.webp exists, so new pictures appear as soon as they are added. Runs at build time. */
const hasPicture = (name: string) => existsSync(join(process.cwd(), "public", "landing", `${name}.webp`));

/** Use the first picture of the list that exists; the last one is the fallback that is already there. */
function firstPicture<T extends { img: string }>(...options: T[]): T {
  return options.find((o) => hasPicture(o.img)) ?? options[options.length - 1];
}

// Wording printed on the blank cards in the template pictures, each placed over its card (inset in %).
// Sizes are in cqw, so the text scales with the picture. Every card ends with a small "The Day" mark.
const Mark = () => <span className="script mark">The Day</span>;
const BIRTHDAY_CARD = {
  inset: "25% 24% 25% 24%",
  content: (
    <>
      <span className="caps2">You&rsquo;re invited to</span>
      <span className="script" style={{ fontSize: "11cqw", marginTop: "3cqw" }}>Ava&rsquo;s</span>
      <span className="font-display" style={{ fontSize: "7cqw" }}>30th Birthday</span>
      <span className="rule-s" />
      <span className="caps2">Saturday &middot; 14 June</span>
      <span className="caps2" style={{ marginTop: "1.4cqw" }}>7 pm &middot; The Terrace</span>
      <Mark />
    </>
  ),
};
const BABY_CARD = {
  inset: "21% 23% 30% 17%",
  content: (
    <>
      <span className="caps2">Please join us for a</span>
      <span className="font-display" style={{ fontSize: "8cqw", letterSpacing: ".12em", marginTop: "3cqw" }}>BABY</span>
      <span className="script" style={{ fontSize: "10cqw", marginTop: "-1cqw" }}>Shower</span>
      <span className="caps2" style={{ marginTop: "3cqw" }}>honouring</span>
      <span className="font-display" style={{ fontSize: "6.4cqw" }}>Emily Smith</span>
      <span className="rule-s" />
      <span className="caps2">Sunday &middot; 20 June &middot; 2 pm</span>
      <Mark />
    </>
  ),
};
const GALA_CARD = {
  inset: "26% 25% 26% 25%",
  content: (
    <>
      <span className="caps2">You are cordially invited to the</span>
      <span className="font-display" style={{ fontSize: "6.4cqw", letterSpacing: ".14em", marginTop: "3cqw" }}>ANNUAL</span>
      <span className="script" style={{ fontSize: "10.5cqw" }}>Evening Gala</span>
      <span className="rule-s" />
      <span className="caps2">Friday &middot; 3 October</span>
      <span className="caps2" style={{ marginTop: "1.4cqw" }}>7 pm &middot; Black tie</span>
      <Mark />
    </>
  ),
};

// Our templates carousel: real designs mixed with other celebrations. Pictures only, no links to demo pages.
const TEMPLATES: TemplateCard[] = [
  { name: "Sepia Garden", img: "shot-garden", event: "Wedding" },
  firstPicture({ name: "Golden Birthday", img: "inv-birthday", event: "Birthday", card: BIRTHDAY_CARD }, { name: "Classic Floral", img: "inv-floral", event: "Wedding" }),
  { name: "Blue Ribbon", img: "shot-ribbon", event: "Wedding" },
  firstPicture({ name: "Sage Baby Shower", img: "inv-baby", event: "Baby Celebration", card: BABY_CARD }, { name: "Modern Portrait", img: "inv-veil", event: "Wedding" }),
  { name: "Golden Renewal", img: "shot-renewal", event: "Anniversary" },
  ...[
    { name: "Evening Gala", img: "inv-corporate", event: "Corporate Event", card: GALA_CARD },
    { name: "Lantern Festival", img: "inv-cultural", event: "Cultural Celebration" },
  ].filter((t) => hasPicture(t.img)),
  { name: "Pressed Scrapbook", img: "shot-scrapbook", event: "Wedding" },
];

const EVENTS: { name: string; img: string; icon: ReactNode }[] = [
  { name: "Wedding", img: "wedding", icon: <><circle cx="16" cy="26" r="9" /><circle cx="28" cy="26" r="9" /><path d="M22 7l-2.800 4h5.600z" /></> },
  { name: "Birthday", img: "birthday", icon: <><rect x="9" y="24" width="26" height="12" rx="1" /><path d="M9 30q3.250 3 6.500 0t6.500 0 6.500 0 6.500 0M22 24v-7M22 8c-2.500 3-1.500 5.500 0 6.500 1.500-1 2.500-3.500 0-6.500z" /></> },
  { name: "Engagement", img: "engagement", icon: <><circle cx="22" cy="28" r="9" /><path d="M16 15l3-6h6l3 6-6 6z" /><path d="M16 15h12" /></> },
  { name: "Anniversary", img: "anniversary", icon: <><path d="M16 33C4 25 6 13 13 13c2.500 0 4 1.500 5 3.500M28 33C16 25 18 13 25 13c7 0 9 12-3 20z" /></> },
  { name: "Baby Celebration", img: "baby", icon: <><ellipse cx="15" cy="28" rx="5" ry="8" /><ellipse cx="29" cy="23" rx="5" ry="8" /><circle cx="10.500" cy="16" r="1.400" /><circle cx="14.500" cy="14" r="1.400" /><circle cx="18.500" cy="16" r="1.400" /><circle cx="24.500" cy="10" r="1.400" /><circle cx="28.500" cy="8" r="1.400" /><circle cx="32.500" cy="10" r="1.400" /></> },
  { name: "Party", img: "party", icon: <><ellipse cx="16" cy="17" rx="7" ry="9" /><ellipse cx="29" cy="15" rx="7" ry="9" /><path d="M16 26q5 7 13 9M29 24q-3 7-7 11" /></> },
  { name: "Corporate Event", img: "corporate", icon: <><rect x="7" y="15" width="30" height="20" rx="2" /><path d="M16 15v-4h12v4M7 25h30" /><rect x="19.500" y="23" width="5" height="4" /></> },
  { name: "Cultural Celebration", img: "cultural", icon: <><path d="M16 12h12M18 8h8v4M14 12l-2 7v11l5 5h10l5-5V19l-2-7M12 21h20M12 29h20M22 21v8" /></> },
  { name: "Custom Event", img: "custom", icon: <><path d="M28 10H11a2 2 0 00-2 2v21a2 2 0 002 2h21a2 2 0 002-2V22M26 26l-7 1.500L20.500 20 32 9l5 5z" /></> },
];

const FEATURES = [
  { t: "Elegant digital invitations", s: "Timeless designs with refined details.", y: 228 },
  { t: "Custom designs that reflect your style", s: "Bespoke creations made just for you.", y: 295 },
  { t: "Easy sharing for you and your guests", s: "Send with ease and keep everyone connected.", y: 362 },
  { t: "Worldwide service", s: "Designed to reach your loved ones, anywhere.", y: 429 },
];

const FEATURE_ICONS: ReactNode[] = [
  <><rect x="6" y="11" width="32" height="23" rx="2" /><path d="M7 13l15 12 15-12" /><path d="M22 21c-3-2-3.500-4-2-4.500 1-.3 1.700.3 2 1 .3-.7 1-1.300 2-1 1.500.5 1 2.500-2 4.500z" /></>,
  <><circle cx="22" cy="15" r="4" /><path d="M22 11c-1-6 5-6 4 0M26 15c6-1 6 5 0 4M22 19c1 6-5 6-4 0M18 15c-6 1-6-5 0-4M22 19v19M22 30c-6-1-8-4-8-8M22 32c5-1 7-4 7-8" /></>,
  <><path d="M6 21L39 6 31 37l-9-9z" /><path d="M22 28l17-22M22 28v9l5-5" /></>,
  <><circle cx="22" cy="22" r="16" /><ellipse cx="22" cy="22" rx="7" ry="16" /><path d="M6 22h32M9 13h26M9 31h26" /></>,
];

const PSTEPS = [
  { n: "01", l: "Choose a design", x: 131, icon: <><rect x="6" y="8" width="32" height="28" /><circle cx="15" cy="17" r="3" /><path d="M6 32l10-9 7 6 6-5 9 8" /></> },
  { n: "02", l: "Add your event details", x: 315, icon: <><path d="M32 22v12H8V10h14M16 28l1-6 15-15 5 5-15 15z" /></> },
  { n: "03", l: "Share with guests", x: 503, icon: <><path d="M6 20L38 6 30 36l-9-9z" /><path d="M21 27l17-21M21 27v9l5-5" /></> },
];

const Heart = () => (
  <svg viewBox="0 0 24 22" fill="currentColor" aria-hidden>
    <path d="M12 21C-4 9.5 3 .5 8.2 2.4 10.2 3.2 11.4 4.600 12 6c.6-1.400 1.800-2.800 3.800-3.600C21 .5 28 9.500 12 21Z" />
  </svg>
);

/** Thin gold rule with a small heart. */
function Rule({ x, y, w, fs = 16 }: { x: number; y: number; w: number; fs?: number }) {
  return (
    <B x={x} y={y} w={w} h={fs} fs={fs} cls="rule" v="zoom">
      <Heart />
    </B>
  );
}

const Svg = ({ children, sw = 1.4, className = "" }: { children: ReactNode; sw?: number; className?: string }) => (
  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
);

export default function Home() {
  return (
    <div id="top" className="landing lp min-h-svh overflow-x-clip">
      <LandingNav />

      {/* 1 · Hero */}
      <section className="lp-scr lp-hero" style={{ background: "#fbf3ea" }} aria-labelledby="hero-h">
        <div className="in pt-24">
          <B x={65} y={140} w={520} fs={56} lh={0.96} m="2.8rem" as="h1" cls="font-display text-[#3b3632]">
            <span id="hero-h">Find the Invitation <br className="hidden min-[900px]:inline" />That Feels Like You</span>
          </B>
          <Rule x={70} y={267} w={115} />
          <B x={65} y={296} w={440} fs={21.5} lh={1.07} m="1.25rem" as="p" cls="text-[#66584d] max-w-sm">
            Join a personalised demo session and explore our beautiful collection of digital invitation templates for every celebration.
          </B>
          <div className="grp flex flex-col items-center gap-3 sm:flex-row">
            <B x={70} y={397} w={216} h={46} fs={21} v="left"><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="gbtn">Book a demo session</a></B>
          </div>
          {/* Starting price, read from the same plans as /pricing. */}
          <B x={70} y={462} w={440} fs={16} m="1rem" as="p" cls="text-[#5c524b]">
            Launch prices from <strong className="font-semibold text-[#2f2925]">{fmt(startingPrice())} MMK</strong>
            <span className="text-[#b8913f]"> &middot; </span>
            <Link href="/pricing" className="text-[#7d6230] underline decoration-[#b8913f]/60 underline-offset-4 hover:text-[#2f2925]">See pricing</Link>
          </B>

          {/* monitor, tablet and phone, built in code */}
          <B x={590} y={95} w={660} h={415} v="drift" cls="w-full min-[900px]:!absolute">
            <div className="devices">
              <D x={94} y={-2} w={480} h={413}>
                <img src="/landing/monitor.webp" alt="" className="lp-img" />
              </D>
              <D x={-5} y={178} w={152} h={214} r={12} b={7} r2={5} cls="bezel">
                <img src="/landing/tablet-peony.webp" alt="" />
              </D>
              <D x={549} y={212} w={101} h={193} r={17} b={6} r2={12} cls="bezel">
                <img src="/landing/phone.webp" alt="" />
              </D>
            </div>
          </B>
          <B x={1238} y={252} w={152} v="right" cls="hide-m"><img src="/landing/vase.webp" alt="" className="lp-img" /></B>

        </div>
      </section>

      {/* Templates: a sliding row of designs for every kind of celebration */}
      <section id="templates" className="relative overflow-hidden px-6 py-20 text-center min-[900px]:py-28" style={{ background: "#f9f1e7" }}>
        <img src="/landing/leaf-c.webp" alt="" className="pointer-events-none absolute top-10 left-2 w-16 opacity-90 sm:left-8 sm:w-24 min-[1200px]:left-[8%] min-[1200px]:w-28" />
        <img src="/landing/celebrate-line.webp" alt="" className="pointer-events-none absolute top-8 right-2 w-24 sm:right-8 sm:w-36 min-[1200px]:right-[8%] min-[1200px]:w-44" />
        <Reveal>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.4rem)] leading-tight text-[#2b2623]">Our templates</h2>
          <div className="rule mx-auto mt-6" style={{ fontSize: 16 }} aria-hidden><Heart /></div>
        </Reveal>
        <Reveal variant="photo">
          <TemplateCarousel cards={TEMPLATES} contactUrl={FACEBOOK_URL} />
        </Reveal>
        <p className="mt-8 text-lg text-[#3b3632] sm:text-xl">
          <span className="text-[#b8913f]">❦</span> Every template can be customised for any celebration.
        </p>
      </section>

      {/* 2 · Services */}
      <section id="services" className="lp-scr" style={{ background: "#f7f0e6" }}>
        <B x={0} y={380} w={470} h={300} cls="hide-m"><span className="block h-full w-full" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(226,208,184,.95), rgba(236,222,202,.55) 55%, transparent 72%)", WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent)", maskImage: "radial-gradient(closest-side, #000 40%, transparent)" }} /></B>
        <B x={0} y={118} w={165} v="left" cls="hide-m"><img src="/landing/leaf-dried.webp" alt="" className="lp-img" /></B>
        <B x={83} y={104} w={258} h={388} v="left" cls="hide-m">
          <div className="relative h-full w-full"><img src="/landing/tablet-frame.webp" alt="" className="lp-img absolute inset-0 h-full" />
            {/* Text sits in the gold arch, nudged right of the leaves and turned with the tablet (-2.4deg). */}
            <div className="absolute top-[18%] right-[12%] left-[20%] flex flex-col items-center text-center text-[#3b3632]" style={{ fontSize: "calc(8 * var(--u))", transform: "rotate(-2.4deg)" }}>
              <span className="caps2" style={{ fontSize: "calc(6 * var(--u))" }}>Together with their families</span>
              <span className="mt-[6%] text-[3.1em]" style={{ letterSpacing: ".06em" }}>SOPHIA</span>
              <span className="mt-[10%] text-[3.1em]" style={{ letterSpacing: ".06em" }}>JAMES</span>
              <span className="mt-[8%] caps2" style={{ fontSize: "calc(5.5 * var(--u))" }}>Invite you to celebrate</span>
              <span className="script text-[2.6em]">their wedding</span>
              <span className="mt-[6%] caps2 leading-snug" style={{ fontSize: "calc(5.5 * var(--u))" }}>Saturday, 12 June 2027<br />at four in the afternoon<br /><br />Villa del Sol<br />Ravello, Italy</span>
            </div>
          </div>
        </B>
        <B x={334} y={215} w={148} h={296} v="right" cls="hide-m z-10">
          <div className="relative h-full w-full"><img src="/landing/phone-frame.webp" alt="" className="lp-img absolute inset-0 h-full" />
            <div className="absolute inset-x-[18%] top-[22%] flex flex-col items-center text-center text-[#3b3632]" style={{ fontSize: "calc(8 * var(--u))", transform: "rotate(-3deg)" }}>
              <span className="caps2" style={{ fontSize: "calc(5.5 * var(--u))" }}>Please join us for a</span>
              <span className="mt-[4%] text-[2.2em]">BABY</span>
              <span className="script text-[2.6em]">Shower</span>
              <span className="mt-[10%] text-[2.1em] font-medium">Emily Smith</span>
              <span className="mt-[10%] caps2" style={{ fontSize: "calc(5 * var(--u))" }}>Sunday, 20 June · 2 pm</span>
              <span className="mt-[8%] caps2" style={{ fontSize: "calc(4.5 * var(--u))" }}>The Grand Hotel<br />Garden Room</span>
            </div>
          </div>
        </B>
        <img src="/landing/bouq-gold.webp" alt="" className="hide-d mx-auto w-36" />
        <B x={1050} y={140} w={238} v="right" cls="hide-m"><img src="/landing/bouq-gold.webp" alt="" className="lp-img" /></B>
        <B x={1205} y={375} w={120} v="right" cls="hide-m"><img src="/landing/leaf-c.webp" alt="" className="lp-img" /></B>
        <div className="in pt-20">
          <B x={560} y={62} w={314} fs={18} m="1.1rem" as="p" cls="text-center text-[#3b3632]">Services</B>
          <Rule x={682} y={97} w={80} fs={14} />
          <B x={520} y={105} w={384} fs={55} lh={1.04} m="2.8rem" as="h2" cls="font-display text-center text-[#2b2623]">For Every Kind <br className="hidden min-[900px]:inline" />of Celebration</B>
          <B x={520} y={245} w={384} fs={16.5} m="1.1rem" as="p" cls="text-center text-[#3b3632]">Beautiful digital invitations for every moment.</B>
          <B x={657} y={305} w={146} h={42} fs={19} v="zoom"><a href="#templates" className="gbtn">See templates</a></B>
          <B x={426} y={415} w={607} h={340} cls="grid w-full max-w-md grid-cols-3 gap-[2px] min-[900px]:max-w-none min-[900px]:gap-[calc(2*var(--u))]" v="up">
            {EVENTS.map((e) => (
              <div key={e.name} className="ev">
                {hasPicture(e.img) && <img src={`/landing/${e.img}.webp`} alt="" className="ev-pic" loading="lazy" />}
                <Svg sw={1.4}>{e.icon}</Svg>
                <span>{e.name}</span>
                <i />
              </div>
            ))}
          </B>
        </div>
      </section>

      {/* 3 · Process */}
      <section id="process" className="lp-scr" style={{ background: "#fbf2e8" }}>
        <B x={801} y={68} w={440} v="right" cls="hide-m"><img src="/landing/plate.webp" alt="" className="lp-img" /></B>
        <B x={700} y={96} w={170} cls="hide-m"><img src="/landing/dried.webp" alt="" className="lp-img" /></B>
        {/* Lettering laid on the card, which sits in the middle of the plate turned about -8.6deg. */}
        <B x={915} y={130} w={230} h={290} v="zoom" cls="hide-m">
          <div className="flex h-full w-full flex-col items-center justify-center text-center" style={{ transform: "rotate(-8.6deg)", paddingLeft: "12%" }}>
            <img src="/landing/bouq-line.webp" alt="" style={{ width: "calc(110 * var(--u))" }} />
            <span className="script mt-[12%] text-[#6f655d]" style={{ fontSize: "calc(30 * var(--u))" }}>The Day</span>
            <span className="rule" style={{ fontSize: "calc(8 * var(--u))", width: "calc(80 * var(--u))" }}><Heart /></span>
            <span className="caps2 mt-[4%] text-[#6f655d]" style={{ fontSize: "calc(9.5 * var(--u))" }}>Digital Invitations</span>
          </div>
        </B>
        <div className="in pt-20">
          <div className="hide-d relative mx-auto w-full max-w-sm">
            <img src="/landing/plate.webp" alt="" className="lp-img" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ transform: "rotate(-8.6deg)", paddingLeft: "12%" }}>
              <img src="/landing/bouq-line.webp" alt="" className="w-[28%]" />
              <span className="script text-2xl text-[#6f655d]">The Day</span>
              <span className="caps2 text-[0.55rem] text-[#6f655d]">Digital Invitations</span>
            </div>
          </div>
          <B x={95} y={88} w={460} fs={47} lh={1.04} m="2.6rem" as="h2" cls="font-display text-center">Thoughtfully <br className="hidden min-[900px]:inline" />Designed for Your Day</B>
          <Rule x={261} y={202} w={122} />
          <ul className="grp flex w-full max-w-sm list-none flex-col gap-6">
            {FEATURES.map((f, i) => (
              <li key={f.t} className="grp">
                <B x={120} y={f.y} w={500} h={52} cls="feat" v="left" delay={i * 90}>
                  <Svg className="ic" sw={1.2}>{FEATURE_ICONS[i]}</Svg>
                  <span className="bar" />
                  <span>
                    <h3 className="font-display">{f.t}</h3>
                    <p>{f.s}</p>
                  </span>
                </B>
              </li>
            ))}
          </ul>

          <B x={30} y={520} w={1305} h={240} cls="panel hide-m" v="zoom"><span /></B>
          <B x={35} y={572} w={105} cls="hide-m"><img src="/landing/leaf-a.webp" alt="" className="lp-img" /></B>
          <B x={185} y={540} w={400} fs={25} as="h3" cls="font-display text-center">Our Simple Process</B>
          <Rule x={333} y={587} w={108} fs={14} />
          <div className="steps grp mt-4">
            {PSTEPS.map((s, i) => (
              <div key={s.n} className="grp contents-d">
                <B x={s.x - 20} y={606} w={180} h={112} cls="step" delay={i * 120}>
                  <b className="font-display text-[#3b3632] min-[900px]:text-[calc(23*var(--u))]">{s.n}</b>
                  <Svg className="min-[900px]:!h-[calc(46*var(--u))] min-[900px]:!w-[calc(46*var(--u))]" sw={1.5}>{s.icon}</Svg>
                  <span className="min-[900px]:text-[calc(15*var(--u))]">{s.l}</span>
                </B>
                {i < 2 && (
                  <B x={i === 0 ? 274 : 459} y={651} w={32} h={16} cls="arrow max-[899px]:hidden">
                    <svg viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h26M21 2l7 6-7 6" /></svg>
                  </B>
                )}
              </div>
            ))}
          </div>
          <B x={702} y={548} w={1} h={190} cls="hide-m"><span className="block h-full w-px bg-[#b8913f]/35" /></B>
          <B x={773} y={543} w={400} fs={25} as="h3" cls="font-display mt-10 text-center min-[900px]:mt-0">Regional Reach</B>
          <Rule x={918} y={590} w={104} fs={14} />
          <B x={766} y={613} w={108} h={108} cls="mt-3 w-24 text-[#b8913f] min-[900px]:mt-0">
            <Svg sw={1}><circle cx="22" cy="22" r="19" /><ellipse cx="22" cy="22" rx="8" ry="19" /><path d="M3 22h38M6 13h32M6 31h32M22 3v38" /></Svg>
          </B>
          <B x={896} y={640} w={380} fs={20.5} as="p" cls="font-display text-[#3b3632]">Worldwide service</B>
          <B x={894} y={676} w={400} fs={20.5} as="p" cls="font-display text-[#8a6d33]">Taiwan · Thailand · Myanmar</B>
          <B x={1160} y={578} w={140} cls="hide-m"><img src="/landing/envelope-line.webp" alt="" className="lp-img" /></B>
        </div>
      </section>

      {/* 4 · Contact */}
      <section id="contact" className="lp-scr" style={{ background: "#f8eee4" }}>
        <B x={700} y={430} w={660} h={300} cls="hide-m"><span className="block h-full w-full" style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(240,226,206,.95), rgba(244,232,214,.5) 55%, transparent 72%)", WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent)", maskImage: "radial-gradient(closest-side, #000 40%, transparent)" }} /></B>
        <B x={1040} y={70} w={250} v="right" cls="hide-m"><img src="/landing/dried.webp" alt="" className="lp-img" /></B>
        <B x={930} y={95} w={150} v="right" cls="hide-m"><img src="/landing/dried.webp" alt="" className="lp-img" style={{ transform: "scaleX(-1) rotate(-6deg)", opacity: .85 }} /></B>
        <B x={828} y={185} w={285} h={430} v="zoom" cls="hide-m">
          <div className="flex h-full w-full items-center justify-center" style={{ background: "linear-gradient(#f9f3ea,#f3e9dc)", boxShadow: "0 30px 50px -28px rgba(120,90,50,.45)", transform: "rotate(1.5deg)" }}>
            {/* A gold laurel wreath with the name set inside it, like a monogram. */}
            <div className="relative" style={{ width: "78%" }}>
              <img src="/landing/wreath-line.webp" alt="" className="lp-img" />
              <span className="script absolute inset-x-0 text-center text-[#6f655d]" style={{ top: "34%", fontSize: "calc(34 * var(--u))" }}>The Day</span>
            </div>
          </div>
        </B>
        <div className="in pt-20">
          <img src="/landing/bouq-gold.webp" alt="" className="hide-d mx-auto w-32" />
          <B x={80} y={118} w={600} fs={58} lh={0.98} m="2.8rem" as="h2" cls="font-display text-center text-[#2f2925]">Let’s Make Your Day <br className="hidden min-[900px]:inline" />Unforgettable</B>
          <Rule x={296} y={262} w={157} />
          <B x={265} y={284} w={200} fs={40} m="2.8rem" as="p" cls="script text-center text-[#8c837d]">The Day</B>
          <B x={190} y={341} w={365} fs={24} m="1.4rem" as="p" cls="font-display text-center font-bold text-[#6b625c]">Digital Invitations</B>
          <B x={150} y={382} w={450} fs={15.8} lh={1.22} m="1.1rem" as="p" cls="text-center text-[#6b625c] max-w-sm">
            We’d love to hear about your celebration. Get in touch to create a beautiful digital invitation that reflects your style and makes your day unforgettable.
          </B>
          <B x={197} y={486} w={420} h={40} cls="ct" v="left">
            <span className="ring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5c-4.900 0-8.700 3.500-8.700 8 0 2.400 1.100 4.500 2.900 6v3l2.800-1.600c1 .3 2 .4 3 .4 4.900 0 8.700-3.500 8.700-8s-3.800-8-8.700-8z" /><path d="M7.800 13.400l2.800-3 2.100 2 2.700-3" /></svg></span>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Messenger: Message us</a>
          </B>
          <B x={197} y={534} w={420} h={40} cls="ct" v="left">
            <span className="ring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.500 12.200V4.500a1 1 0 011-1h7.700l8.300 8.300a1 1 0 010 1.400l-7 7a1 1 0 01-1.400 0z" /><circle cx="8" cy="8" r="1.400" /></svg></span>
            <Link href="/pricing">Pricing: from {fmt(startingPrice())} MMK</Link>
          </B>
          <B x={263} y={594} w={183} h={44} fs={22} v="zoom"><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="gbtn">Get in touch</a></B>
        </div>
      </section>

      {/* Footer: brand and links on the left, copyright on the right (stacked and centred on phones). */}
      <footer className="border-t border-[#c9a96a]/35 text-[#5c524b]" style={{ background: "#f3e8dc" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-x-5 gap-y-1 sm:flex-row">
            <a href="#top" className="flex items-baseline gap-2.5">
              <span className="script text-[1.9rem] leading-none text-[#3b3632]">The Day</span>
              <span className="caps2 text-[0.62rem] text-[#6b625c]">Digital Invitations</span>
            </a>
            <span className="hidden h-5 w-px bg-[#c9a96a]/50 sm:block" aria-hidden />
            <nav className="font-display text-[1.02rem]" aria-label="Footer">
              <a href="#templates" className="hover:text-[#2f2925]">Templates</a>
              <span className="px-2 text-[#b8913f]" aria-hidden>&middot;</span>
              <Link href="/pricing" className="hover:text-[#2f2925]">Pricing</Link>
              <span className="px-2 text-[#b8913f]" aria-hidden>&middot;</span>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#2f2925]">Messenger</a>
            </nav>
          </div>
          <p className="text-sm text-[#6b625c]">&copy; <CurrentYear /> The Day by Bright Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
