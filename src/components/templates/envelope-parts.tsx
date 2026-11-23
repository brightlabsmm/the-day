"use client";

/*
 * Animated pieces of the Envelope design: the cover hero, the letter whose
 * flap opens as it scrolls into view, and the photo wall. All motion is
 * reversible (tied to scroll position or replayed on the way out).
 */
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { albumRows, togetherPhotos, type AlbumPhoto } from "@/lib/album";
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
  backdrop = null,
}: {
  locale: Locale;
  names: { one: string; two: string };
  monogram: string;
  dateLong: string;
  timeRange: string;
  venue: string;
  cover: { src: string; alt: string } | null;
  /** Soft artwork behind the whole cover (see wedding-backgrounds.ts). */
  backdrop?: string | null;
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
      {backdrop && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Mirrored on large screens so the building sits behind the photo and the quiet sky behind the names. */}
          <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover object-left opacity-40 lg:-scale-x-100 lg:object-right lg:opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--paper)]/45 via-[color:var(--paper)]/60 to-[color:var(--paper)] lg:bg-gradient-to-r lg:from-[color:var(--paper)]/85 lg:via-[color:var(--paper)]/35 lg:to-[color:var(--paper)]/10" />
        </div>
      )}
      <div className="tpl-wide relative grid min-h-[100svh] items-center gap-8 px-[clamp(1.25rem,5vw,3rem)] pt-20 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-20">
        {/* Words */}
        <motion.div style={{ y: textY, opacity: fade }} className="order-2 text-center lg:order-1 lg:text-left">
          {/* Keyed on `open` so the entrance always starts from the top once the envelope is opened. */}
          <motion.div key={open ? "open" : "sealed"} variants={heroText} initial="hidden" animate={open ? "show" : "hidden"}>
            <motion.p variants={heroLine} className="tpl-eyebrow lg:text-left">
              {s("weddingInvitationLabel", locale)}
            </motion.p>
            <motion.h1 variants={heroText} className={`tpl-script mt-4 text-[color:var(--navy)] ${my ? "text-[clamp(1.55rem,5vw,2.4rem)] leading-[1.7]" : "text-[clamp(2.7rem,7.5vw,4.4rem)] lg:whitespace-nowrap"}`}>
              <motion.span variants={heroLine} className="block">
                {names.one}
              </motion.span>
              <motion.span variants={heroLine} className={`block text-[0.62em] text-[color:var(--gold)] ${my ? "leading-[1.7]" : "leading-[1.2]"}`}>
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
              <motion.p variants={heroLine} className={`tpl-display mt-6 text-[color:var(--ink)] italic ${my ? "text-[1.05rem] not-italic" : "text-[1.45rem]"}`}>
                {dateLong}
              </motion.p>
            )}
            {timeRange && (
              <motion.p variants={heroLine} className={`mt-1 text-[color:var(--ink-soft)] ${my ? "text-[0.9rem]" : "text-[1.02rem]"}`}>
                {timeRange}
              </motion.p>
            )}
            {venue && (
              <motion.p variants={heroLine} className={`mt-3 text-[color:var(--ink-soft)] ${my ? "text-[0.9rem]" : "text-[1.02rem]"}`}>
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
                className="seal seal-mark tpl-display absolute -bottom-7 left-1/2 -ml-9 grid size-[4.5rem] place-items-center rounded-full pt-[0.45em] pl-[0.1em] text-[1.1rem] leading-none font-semibold tracking-wide"
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

/* ───────────────────────── Feature photo ───────────────────────── */

/**
 * One full-bleed photograph as its own moment: it eases back as it scrolls into
 * view, fades into the page at the bottom, and a frosted card with the couple's
 * names rests across its lower edge.
 */
export function EnvelopeFeature({
  photo,
  names,
  dateLong,
  locale,
}: {
  photo: AlbumPhoto;
  names: { one: string; two: string };
  dateLong: string;
  locale: Locale;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.14, 1.04, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-18, 18]);
  const my = locale === "my";

  return (
    <section ref={ref} aria-label={s("featureEyebrow", locale) || s("featureLine", locale)} lang={locale} className="relative bg-[color:var(--paper)] pb-14">
      <div className="relative mx-auto h-[clamp(26rem,112vw,44rem)] overflow-hidden lg:h-[32rem] lg:max-w-5xl">
        <motion.div style={{ scale, y: drift }} className="absolute -inset-y-6 inset-x-0">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover [object-position:72%_40%]" />
        </motion.div>
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[color:var(--paper)] to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color:var(--paper)] to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative z-10 mx-auto -mt-24 w-[min(88%,30rem)] border border-[color:var(--gold-soft)] bg-[color:var(--ivory)]/85 px-6 py-8 text-center shadow-[0_24px_50px_-30px_rgba(79,62,49,.6)] outline outline-1 -outline-offset-[7px] outline-[color:var(--gold-soft)] backdrop-blur-md"
      >
        {s("featureEyebrow", locale) && <p className="tpl-eyebrow">{s("featureEyebrow", locale)}</p>}
        <p className={`tpl-script ${s("featureEyebrow", locale) ? "mt-3" : ""} text-[color:var(--navy)] ${my ? "text-[1.2rem] leading-[2]" : "text-[clamp(2.2rem,8vw,3rem)]"}`}>{s("featureLine", locale)}</p>
        <span aria-hidden className="mx-auto mt-4 block h-px w-16 bg-[color:var(--gold)]" />
        <p className="tpl-eyebrow mt-4">
          {names.one} &amp; {names.two}
        </p>
        {dateLong && <p className={`mt-1 text-[color:var(--ink-soft)] ${my ? "text-[0.85rem]" : "text-[0.95rem]"}`}>{dateLong}</p>}
      </motion.div>
    </section>
  );
}

/* ───────────────────────── Photo album ───────────────────────── */

/**
 * A quiet printed-album page: thin gold frames, even gaps, no tilt. Wide photos
 * and album spreads take a full row; portraits sit two to a row.
 */
export function EnvelopeGallery({ photos: allPhotos, locale }: { photos: AlbumPhoto[]; locale: Locale }) {
  const [index, setIndex] = useState<number | null>(null);
  const photos = togetherPhotos(allPhotos);
  if (photos.length === 0) return null;
  const rows = albumRows(photos);
  const at = (p: AlbumPhoto) => photos.indexOf(p);

  const frame = (p: AlbumPhoto, i: number, sizes: string) => (
    <motion.button
      key={p.id}
      type="button"
      onClick={() => setIndex(at(p))}
      aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: EASE }}
      className="group block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)]"
    >
      <span className="relative block overflow-hidden" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
        <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </span>
    </motion.button>
  );

  // Three photos: one large print with two beneath it (phones) or beside it (wider screens),
  // every cell cropped to fill so the block is always a clean rectangle.
  const cell = (p: AlbumPhoto, i: number, className: string, sizes: string) => (
    <motion.button
      key={p.id}
      type="button"
      onClick={() => setIndex(at(p))}
      aria-label={`${s("viewPhoto", locale)}${p.alt ? `: ${p.alt}` : ""}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
      className={`group relative block cursor-pointer overflow-hidden rounded-[3px] shadow-[0_22px_40px_-30px_rgba(79,62,49,.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-deep)] ${className}`}
    >
      <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
    </motion.button>
  );
  const bento = photos.length === 3;

  return (
    <section id="gallery" aria-labelledby="gallery-heading" lang={locale} className="tpl-section">
      <div className="tpl-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center"
        >
          <p className="tpl-eyebrow">{s("galleryEyebrow", locale)}</p>
          <h2 id="gallery-heading" className="tpl-h2">
            {s("galleryHeading", locale)}
          </h2>
          <p className={`mx-auto mt-3 max-w-md text-[color:var(--ink-soft)] italic ${locale === "my" ? "text-[0.9rem] not-italic" : "text-[1.05rem]"}`}>{s("momentsSubtitle", locale)}</p>
        </motion.div>

        {bento && (
          <div className="mx-auto mt-10 grid w-full max-w-[56rem] grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-12 sm:grid-rows-2 sm:gap-4 sm:aspect-[16/9]">
            {cell(photos[0], 0, "aspect-[3/2] sm:col-span-7 sm:row-span-2 sm:aspect-auto", "(max-width: 640px) 92vw, 600px")}
            {cell(photos[1], 1, "aspect-[3/2] sm:col-span-5 sm:aspect-auto", "(max-width: 640px) 46vw, 420px")}
            {cell(photos[2], 2, "aspect-[3/2] sm:col-span-5 sm:aspect-auto", "(max-width: 640px) 46vw, 420px")}
          </div>
        )}

        <div className={`mx-auto mt-10 flex w-full max-w-[46rem] flex-col gap-4 sm:mt-12 sm:gap-6 ${bento ? "hidden" : ""}`}>
          {rows.map((row, r) =>
            row.type === "single" ? (
              <div key={row.photos[0].id} className={row.photos[0].height > row.photos[0].width * 1.1 ? "mx-auto w-[68%]" : ""}>
                {frame(row.photos[0], r, "(max-width: 640px) 92vw, 760px")}
              </div>
            ) : (
              <div key={row.photos[0].id} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {row.photos.map((p, i) => frame(p, i, "(max-width: 640px) 46vw, 380px"))}
              </div>
            ),
          )}
        </div>
      </div>
      {index !== null && <Viewer photos={photos} index={index} locale={locale} onChange={setIndex} onClose={() => setIndex(null)} />}
    </section>
  );
}
