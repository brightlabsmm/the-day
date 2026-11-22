"use client";

/*
 * Animated pieces of the Envelope design: the cover hero, the letter whose
 * flap opens as it scrolls into view, and the photo wall. All motion is
 * reversible (tied to scroll position or replayed on the way out).
 */
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import type { AlbumPhoto } from "@/lib/album";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { Viewer } from "@/components/invite/gallery";
import { useGateOpen } from "./gate";
import { useScrollRange, useSectionProgress } from "./scroll-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Cover hero ───────────────────────── */

const heroText: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};
const heroLine: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

export function EnvelopeHero({
  locale,
  names,
  monogram,
  dateLong,
  timeRange,
  venue,
  cover,
}: {
  locale: Locale;
  names: { one: string; two: string };
  monogram: string;
  dateLong: string;
  timeRange: string;
  venue: string;
  cover: { src: string; alt: string } | null;
}) {
  const open = useGateOpen();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // As the hero scrolls away: the photo drifts down and zooms a touch, the words lift and fade.
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const photoScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const my = locale === "my";

  return (
    <header ref={ref} id="top" className="env-hero relative overflow-hidden">
      <div className="tpl-wide grid min-h-[100svh] items-center gap-8 px-[clamp(1.25rem,5vw,3rem)] pt-20 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-20">
        {/* Words */}
        <motion.div style={{ y: textY, opacity: fade }} className="order-2 text-center lg:order-1 lg:text-left">
          {/* Keyed on `open` so the entrance always starts from the top once the envelope is opened. */}
          <motion.div key={open ? "open" : "sealed"} variants={heroText} initial="hidden" animate={open ? "show" : "hidden"}>
            <motion.p variants={heroLine} className="tpl-eyebrow lg:text-left">
              {s("weddingInvitationLabel", locale)}
            </motion.p>
            <motion.h1 variants={heroText} className={`tpl-script mt-4 text-[color:var(--navy)] ${my ? "text-[clamp(2.2rem,7vw,3.6rem)]" : "text-[clamp(3.1rem,9vw,5.4rem)] lg:whitespace-nowrap"}`}>
              <motion.span variants={heroLine} className="block">
                {names.one}
              </motion.span>
              <motion.span variants={heroLine} className="block text-[0.62em] leading-[1.2] text-[color:var(--gold)]">
                &amp;
              </motion.span>
              <motion.span variants={heroLine} className="block">
                {names.two}
              </motion.span>
            </motion.h1>
            <motion.span
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE } } }}
              className="mx-auto mt-7 block h-px w-28 origin-center bg-[color:var(--gold)] lg:mx-0 lg:origin-left"
              aria-hidden
            />
            {dateLong && (
              <motion.p variants={heroLine} className="tpl-display mt-6 text-[1.45rem] text-[color:var(--ink)] italic">
                {dateLong}
              </motion.p>
            )}
            {timeRange && (
              <motion.p variants={heroLine} className="mt-1 text-[1.02rem] text-[color:var(--ink-soft)]">
                {timeRange}
              </motion.p>
            )}
            {venue && (
              <motion.p variants={heroLine} className="mt-3 inline-flex items-center gap-2 text-[1.02rem] text-[color:var(--ink-soft)]">
                <MapPin className="size-4 shrink-0 text-[color:var(--gold)]" aria-hidden />
                {venue}
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Arched photo with the wax seal */}
        {cover && (
          <motion.div style={{ y: photoY }} className="relative order-1 mx-auto w-full max-w-[15.5rem] sm:max-w-[22rem] lg:order-2 lg:max-w-[26rem]">
            <motion.div
              key={open ? "open" : "sealed"}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 1.2, ease: EASE }}
              className="relative"
            >
              <div className="rounded-t-[999px] border border-[color:var(--gold-soft)] p-2 shadow-[0_40px_70px_-40px_rgba(79,62,49,.75)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] bg-[color:var(--paper)]">
                  <motion.div style={{ scale: photoScale }} className="absolute inset-0">
                    <Image src={cover.src} alt={cover.alt} fill priority sizes="(max-width: 1024px) 80vw, 420px" className="object-cover" />
                  </motion.div>
                </div>
              </div>
              <motion.span
                initial={{ scale: 0, rotate: -40 }}
                animate={open ? { scale: 1, rotate: -8 } : { scale: 0, rotate: -40 }}
                transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.9 }}
                className="seal seal-mark tpl-display absolute -bottom-7 left-1/2 -ml-9 grid size-[4.5rem] place-items-center rounded-full text-[1.1rem] font-semibold tracking-wide"
                aria-hidden
              >
                {monogram}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: fade }}
        className="pointer-events-none absolute inset-x-0 bottom-5 hidden flex-col items-center gap-2 text-[color:var(--ink-soft)] sm:flex"
        aria-hidden
      >
        <span className="tpl-eyebrow text-[0.62rem]">{s("scrollDown", locale)}</span>
        <span className="relative h-10 w-px overflow-hidden bg-[color:var(--gold-soft)]">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-[color:var(--gold-deep)]"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </header>
  );
}

/* ───────────────────── Letter with opening flap ───────────────────── */

export function EnvelopeLetter({ id, monogram, children }: { id?: string; monogram: string; children: ReactNode }) {
  const { ref, progress } = useSectionProgress<HTMLElement>();
  // The flap swings open over the first third of the section's trip up the screen, then the letter rises.
  const flap = useScrollRange(progress, [0.08, 0.38], [0, -178]);
  const sealScale = useScrollRange(progress, [0.06, 0.22], [1, 0]);
  const letterY = useScrollRange(progress, [0.18, 0.45], [70, 0]);
  const letterOpacity = useTransform(progress, [0.16, 0.4], [0, 1]);

  return (
    <section ref={ref} id={id} className="env-letter tpl-section relative pt-[clamp(6rem,14vw,9rem)]">
      <div className="relative mx-auto w-full max-w-2xl [perspective:1400px]">
        {/* The envelope back the letter sits in */}
        <div className="absolute inset-x-0 top-0 h-full rounded-[3px] bg-[color:var(--paper-deep)] shadow-[0_40px_60px_-40px_rgba(79,62,49,.6)]" aria-hidden />
        {/* Flap: closed, it points down over the letter; open, it folds up behind */}
        <motion.div
          style={{ rotateX: flap, transformOrigin: "top center" }}
          className="absolute inset-x-0 top-0 z-20 [transform-style:preserve-3d]"
          aria-hidden
        >
          <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="block h-[clamp(5.5rem,18vw,9rem)] w-full drop-shadow-[0_10px_10px_rgba(79,62,49,.18)]">
            <path d="M0 0H400L212 142a18 18 0 0 1-24 0Z" fill="var(--paper)" stroke="var(--gold-soft)" strokeWidth="1.2" />
            <path d="M14 6H386L206 132a9 9 0 0 1-12 0Z" fill="none" stroke="var(--gold-soft)" strokeWidth="0.8" opacity=".7" />
          </svg>
          <motion.span
            style={{ scale: sealScale }}
            className="seal seal-mark tpl-display absolute top-[calc(clamp(5.5rem,18vw,9rem)-2.4rem)] left-1/2 -ml-8 grid size-16 place-items-center rounded-full text-base font-semibold"
          >
            {monogram}
          </motion.span>
        </motion.div>

        {/* The letter */}
        <motion.div
          style={{ y: letterY, opacity: letterOpacity }}
          className="relative z-10 mx-3 border border-[color:var(--gold-soft)] bg-[color:var(--ivory)] px-[clamp(1.25rem,5vw,3.5rem)] pt-[clamp(3rem,9vw,4.5rem)] pb-[clamp(2.5rem,7vw,3.5rem)] text-center shadow-[0_24px_50px_-30px_rgba(79,62,49,.55)] outline outline-1 -outline-offset-[7px] outline-[color:var(--gold-soft)] sm:mx-6"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Photo wall ───────────────────────── */

function Column({ photos, offset, speed, onOpen, locale }: { photos: { p: AlbumPhoto; i: number }[]; offset: number; speed: number; onOpen: (i: number) => void; locale: Locale }) {
  const { ref, progress } = useSectionProgress<HTMLDivElement>();
  const y = useScrollRange(progress, [0, 1], [speed, -speed]);
  return (
    <motion.div ref={ref} style={{ y, marginTop: offset }} className="flex flex-col gap-3 sm:gap-5">
      {photos.map(({ p, i }) => (
        <motion.button
          key={p.id}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="group relative block w-full cursor-pointer overflow-hidden bg-white p-1.5 shadow-[0_18px_36px_-22px_rgba(79,62,49,.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)] sm:p-2"
        >
          <span className="relative block overflow-hidden" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 48vw, 380px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

export function EnvelopeGallery({ photos, locale }: { photos: AlbumPhoto[]; locale: Locale }) {
  const [index, setIndex] = useState<number | null>(null);
  if (photos.length === 0) return null;
  const indexed = photos.map((p, i) => ({ p, i }));
  const split = (n: number) => Array.from({ length: n }, (_, c) => indexed.filter((_, k) => k % n === c));
  const two = split(2);
  const three = split(3);

  return (
    <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section overflow-hidden">
      <div className="tpl-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center"
        >
          <p className="tpl-eyebrow">{s("galleryEyebrow", locale)}</p>
          <h2 id="gallery-heading" className="tpl-h2">
            {s("galleryHeading", locale)}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[1.05rem] text-[color:var(--ink-soft)] italic">{s("momentsSubtitle", locale)}</p>
        </motion.div>

        {/* Phones: two columns drifting in opposite directions */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:hidden">
          <Column photos={two[0]} offset={0} speed={24} onOpen={setIndex} locale={locale} />
          <Column photos={two[1]} offset={48} speed={-24} onOpen={setIndex} locale={locale} />
        </div>
        {/* Tablets and up: three columns, the middle one against the scroll */}
        <div className="mt-14 hidden grid-cols-3 gap-5 md:grid">
          <Column photos={three[0]} offset={0} speed={50} onOpen={setIndex} locale={locale} />
          <Column photos={three[1]} offset={80} speed={-50} onOpen={setIndex} locale={locale} />
          <Column photos={three[2]} offset={30} speed={80} onOpen={setIndex} locale={locale} />
        </div>
      </div>
      {index !== null && <Viewer photos={photos} index={index} locale={locale} onChange={setIndex} onClose={() => setIndex(null)} />}
    </section>
  );
}
