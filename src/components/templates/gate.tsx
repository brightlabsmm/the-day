"use client";

/*
 * Opening screens for the Envelope and Scratch designs. The page content is
 * rendered underneath (inert, so it cannot be tabbed to) and the overlay
 * fades away once the guest opens it. "Skip" and a plain button are always
 * available, so nobody has to scratch or hunt for the seal.
 */
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

type Props = {
  kind: "envelope" | "scratch" | "theatre" | "shutters" | "silk";
  slug: string;
  token: string | null;
  locale: Locale;
  monogram: string;
  coverSrc: string | null;
  guestLabel: string;
  dateLabel: string;
  /** Couple names and place, shown on the theatre curtain. */
  names?: { one: string; two: string };
  place?: string;
  onOpenAction: (slug: string, token: string) => Promise<void>;
  /** Showcase preview: ignore and never save the "already opened" flag. */
  preview?: boolean;
  children: ReactNode;
};

const storageKey = (slug: string) => `theday:opened:${slug}`;

function useOpenedThisSession(slug: string) {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(storageKey(slug)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
}

export function Gate({ kind, slug, token, locale, monogram, coverSrc, guestLabel, dateLabel, names, place, onOpenAction, preview = false, children }: Props) {
  const reduceMotion = useReducedMotion();
  const openedBefore = useOpenedThisSession(slug) && !preview;
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const [, startTransition] = useTransition();
  const isOpen = phase === "open" || openedBefore;

  useEffect(() => {
    if (isOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [isOpen]);

  const finish = useCallback(() => {
    if (!preview) {
      try {
        sessionStorage.setItem(storageKey(slug), "1");
      } catch {}
    }
    setPhase("open");
    window.scrollTo(0, 0);
  }, [slug, preview]);

  // The open is recorded when the guest acts, not on page load, so link-preview bots do not count.
  const record = useCallback(() => {
    if (token) startTransition(() => onOpenAction(slug, token));
  }, [onOpenAction, slug, token]);

  const begin = useCallback(() => {
    if (phase !== "sealed") return;
    record();
    if (reduceMotion) finish();
    else setPhase("opening");
  }, [finish, phase, record, reduceMotion]);

  const skip = useCallback(() => {
    if (phase === "open") return;
    record();
    finish();
  }, [finish, phase, record]);

  // The shutters open by themselves after a moment, like a window being thrown open.
  // This does not count as the guest opening their link; their first tap or scroll does.
  useEffect(() => {
    if (kind !== "shutters" || isOpen || phase !== "sealed") return;
    const id = window.setTimeout(() => (reduceMotion ? finish() : setPhase("opening")), 1300);
    return () => window.clearTimeout(id);
  }, [kind, isOpen, phase, reduceMotion, finish]);

  return (
    <>
      <div inert={!isOpen} aria-hidden={!isOpen}>
        {children}
      </div>

      {!isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={s("openInvitation", locale)}
          lang={locale}
          className="fixed inset-0 z-50 overflow-hidden"
          animate={{ opacity: phase === "opening" ? 0 : 1 }}
          transition={{ duration: 0.7, delay: phase === "opening" ? (kind === "envelope" ? 1.1 : kind === "theatre" ? 1.5 : kind === "shutters" ? 1.9 : kind === "silk" ? 1.2 : 0.9) : 0, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (phase === "opening") finish();
          }}
        >
          {kind === "silk" ? (
            <SilkFace opening={phase === "opening"} onOpen={begin} locale={locale} names={names} dateLabel={dateLabel} place={place} />
          ) : kind === "shutters" ? (
            <ShuttersFace
              opening={phase === "opening"}
              onOpen={begin}
              locale={locale}
              monogram={monogram}
              names={names}
              dateLabel={dateLabel}
              place={place}
            />
          ) : kind === "theatre" ? (
            <TheatreFace
              opening={phase === "opening"}
              onOpen={begin}
              locale={locale}
              monogram={monogram}
              names={names}
              dateLabel={dateLabel}
              place={place}
            />
          ) : kind === "envelope" ? (
            <EnvelopeFace opening={phase === "opening"} onOpen={begin} locale={locale} monogram={monogram} guestLabel={guestLabel} />
          ) : (
            <ScratchFace
              opening={phase === "opening"}
              onOpen={begin}
              locale={locale}
              monogram={monogram}
              coverSrc={coverSrc}
              dateLabel={dateLabel}
            />
          )}
          <button
            type="button"
            onClick={skip}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 rounded-full bg-black/60 px-4 py-2 text-[0.65rem] tracking-[0.2em] text-white uppercase backdrop-blur [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case"
          >
            {s("skip", locale)}
          </button>
        </motion.div>
      )}
    </>
  );
}

/* ── Envelope ───────────────────────────────────────────────── */

function WaxSeal({ monogram }: { monogram: string }) {
  return (
    <svg viewBox="0 0 120 120" className="size-full drop-shadow-[0_6px_10px_rgba(90,60,30,0.35)]" aria-hidden>
      <defs>
        <radialGradient id="wax" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ecd9b0" />
          <stop offset="0.55" stopColor="#cdaa72" />
          <stop offset="1" stopColor="#a8834c" />
        </radialGradient>
      </defs>
      <path
        d="M60 5c10 0 14 8 24 9 9 1 17 6 18 16 1 8 9 12 9 22 0 9-7 13-9 21-2 10-8 18-18 20-9 2-14 9-24 9s-15-7-24-9c-10-2-16-10-18-20-2-8-9-12-9-21 0-10 8-14 9-22 1-10 9-15 18-16 10-1 14-9 24-9Z"
        fill="url(#wax)"
      />
      <circle cx="60" cy="60" r="39" fill="none" stroke="#8d6a37" strokeOpacity="0.45" strokeWidth="2" />
      <circle cx="60" cy="60" r="35.5" fill="none" stroke="#f7ebcb" strokeOpacity="0.55" />
      <text
        x="60"
        y="63"
        textAnchor="middle"
        fontSize="25"
        fill="#8a6736"
        style={{ fontFamily: "var(--font-playfair), serif", textShadow: "0 1px 0 rgba(255,240,205,.6)" }}
      >
        {monogram.replace("&", " & ")}
      </text>
      {/* two small sprigs under the letters */}
      <g fill="none" stroke="#8d6a37" strokeOpacity="0.7" strokeWidth="1.1" strokeLinecap="round">
        <path d="M42 82c7 5 13 6 18 6s11-1 18-6" />
        <path d="M49 84c-2-3-1-6 1-8M56 87c-1-3 0-6 2-8M71 84c2-3 1-6-1-8M64 87c1-3 0-6-2-8" />
      </g>
    </svg>
  );
}

function EnvelopeFace({
  opening,
  onOpen,
  locale,
  monogram,
  guestLabel,
}: {
  opening: boolean;
  onOpen: () => void;
  locale: Locale;
  monogram: string;
  guestLabel: string;
}) {
  return (
    <div className="relative h-full w-full bg-[#f4ecdd]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_30%,rgba(255,252,244,.8),transparent_70%),var(--grain)]"
      />
      {/* the folds of the envelope */}
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <polygon points="0,0 0,100 50,55" fill="#efe5d2" />
        <polygon points="100,0 100,100 50,55" fill="#efe5d2" />
        <polygon points="0,100 100,100 50,55" fill="#e9dcc5" />
        <g stroke="#d9c8a8" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke">
          <path d="M0 0 50 55 100 0M0 100 50 55 100 100" />
        </g>
      </svg>
      {/* the flap */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#f8f1e3,#efe4cf)] shadow-[0_8px_18px_rgba(90,60,30,.18)]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 55%)",
          transformOrigin: "top",
          transform: opening ? "perspective(1400px) rotateX(180deg)" : "perspective(1400px) rotateX(0deg)",
          backfaceVisibility: "hidden",
          transition: "transform 1s cubic-bezier(.22,1,.36,1)",
        }}
      />

      <button
        type="button"
        onClick={onOpen}
        disabled={opening}
        aria-label={s("openInvitation", locale)}
        className="absolute left-1/2 top-[55%] size-[clamp(108px,30vw,150px)] -translate-x-1/2 -translate-y-1/2 transition duration-500 hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a6736]"
        style={{ opacity: opening ? 0 : 1, scale: opening ? 0.85 : 1 }}
      >
        <WaxSeal monogram={monogram} />
      </button>

      <div className="absolute inset-x-0 bottom-[12%] text-center text-[#6a5340]">
        <p className="tpl-display text-[clamp(1.5rem,5vw,2.2rem)]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          {s("clickToOpen", locale)}
        </p>
        <p className="mt-2 text-[0.85rem] opacity-70">
          {s("dear", locale)} {guestLabel}
        </p>
      </div>
    </div>
  );
}

/* ── Scratch ────────────────────────────────────────────────── */

function ScratchFace({
  opening,
  onOpen,
  locale,
  monogram,
  coverSrc,
  dateLabel,
}: {
  opening: boolean;
  onOpen: () => void;
  locale: Locale;
  monogram: string;
  coverSrc: string | null;
  dateLabel: string;
}) {
  return (
    <div className="relative grid h-full w-full place-items-center bg-[#fbe4e7]">
      {coverSrc && <Image src={coverSrc} alt="" fill priority sizes="100vw" className="object-cover" />}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,243,245,.55),rgba(255,236,240,.35))]" />

      <div className="relative flex flex-col items-center px-4 text-center">
        <p
          className="text-[clamp(1.2rem,4.5vw,1.7rem)] tracking-[0.12em] text-[#a93a55] italic [&:lang(my)]:not-italic [&:lang(my)]:tracking-normal"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {s("scratchTitle", locale)}
        </p>

        <div className="relative mt-6 size-[min(74vw,300px)]">
          {/* what is under the coating */}
          <div className="absolute inset-0 grid place-items-center rounded-full bg-[#fff6f5] shadow-[0_10px_30px_rgba(169,58,85,.25)]">
            <div className="text-[#94283f]">
              <p className="text-[clamp(2rem,9vw,3rem)] leading-none" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {monogram.replace("&", " & ")}
              </p>
              <p className="mt-3 text-[0.8rem] tracking-[0.16em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">
                {dateLabel}
              </p>
            </div>
          </div>
          <ScratchCanvas locale={locale} done={opening} onReveal={onOpen} />
        </div>

        <p className="mt-6 text-[0.72rem] tracking-[0.28em] text-[#a93a55] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">
          {s("scratchHint", locale)}
        </p>
        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          className="mt-4 rounded-full border border-[#a93a55] px-6 py-2 text-[0.72rem] tracking-[0.2em] text-[#a93a55] uppercase transition hover:bg-[#a93a55] hover:text-white [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case"
        >
          {s("clickToOpen", locale)}
        </button>
      </div>
    </div>
  );
}

function ScratchCanvas({ locale, done, onReveal }: { locale: Locale; done: boolean; onReveal: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const fired = useRef(false);
  const text = s("scratchTouch", locale);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth * dpr;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = ctx.createRadialGradient(size * 0.35, size * 0.3, size * 0.05, size / 2, size / 2, size * 0.75);
    g.addColorStop(0, "#f08ba1");
    g.addColorStop(0.55, "#d9546f");
    g.addColorStop(1, "#b32b4a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // a heart outline
    const c = size / 2;
    const k = size / 300;
    ctx.save();
    ctx.translate(c, c - 22 * k);
    ctx.scale(k, k);
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.bezierCurveTo(-52, -6, -30, -44, 0, -18);
    ctx.bezierCurveTo(30, -44, 52, -6, 0, 26);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.font = `${15 * k}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, c, c + 52 * k);
  }, [text]);

  const coverage = useCallback(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { width: w, height: h } = canvas;
    const data = ctx.getImageData(0, 0, w, h).data;
    const r = w / 2;
    let total = 0;
    let clear = 0;
    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 8) {
        if ((x - r) ** 2 + (y - r) ** 2 > r * r) continue;
        total++;
        if (data[(y * w + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }, []);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !e.buttons) {
      last.current = null;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const p = { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sx };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 38 * sx;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 6 === 0 && !fired.current && coverage() > 0.42) {
      fired.current = true;
      onReveal();
    }
  };

  return (
    <canvas
      ref={ref}
      aria-hidden
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = null;
        scratch(e);
      }}
      onPointerMove={scratch}
      onPointerUp={() => (last.current = null)}
      className={`absolute inset-0 size-full touch-none cursor-pointer rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,.5)] transition-opacity duration-700 ${done ? "opacity-0" : "opacity-100"}`}
    />
  );
}

/* ── Theatre ────────────────────────────────────────────────── */

const VELVET =
  "repeating-linear-gradient(90deg,#4f0c18 0,#7b1727 14px,#5d0f1d 28px,#3f0911 42px), linear-gradient(180deg,rgba(0,0,0,.35),transparent 30%,rgba(0,0,0,.25))";

function TheatreFace({
  opening,
  onOpen,
  locale,
  monogram,
  names,
  dateLabel,
  place,
}: {
  opening: boolean;
  onOpen: () => void;
  locale: Locale;
  monogram: string;
  names?: { one: string; two: string };
  dateLabel: string;
  place?: string;
}) {
  const curtain = (side: "left" | "right") => (
    <div
      aria-hidden
      className={`absolute top-0 bottom-0 w-1/2 ${side === "left" ? "left-0" : "right-0"}`}
      style={{
        backgroundImage: VELVET,
        backgroundBlendMode: "multiply",
        boxShadow: side === "left" ? "12px 0 30px rgba(0,0,0,.55)" : "-12px 0 30px rgba(0,0,0,.55)",
        transform: `translateX(${opening ? "0%" : side === "left" ? "-84%" : "84%"})`,
        transition: "transform 1.3s cubic-bezier(.65,0,.35,1)",
      }}
    />
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#150a08] text-[#f1e4c8]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_58%_at_50%_36%,#5a3422,#1d0f0a_72%,#0e0705)]" />
      {/* the stage floor */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[13%] border-t border-[#b8913f]/60 bg-[linear-gradient(180deg,#3d2112,#160b06)]"
      />

      <div className="relative z-0 flex h-full flex-col items-center justify-center px-6 text-center">
        <span
          aria-hidden
          className="grid size-14 place-items-center border border-[#c9a45a] text-[1.1rem] tracking-[0.12em] text-[#e2c887]"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {monogram.replace("&", "")}
        </span>
        <p className="mt-6 text-[0.62rem] tracking-[0.32em] text-[#d9bf86] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-sm">
          {s("theatreTogether", locale)}
        </p>
        <p className="tpl-script mt-4 text-[clamp(2.8rem,10vw,4.6rem)] text-[#f4e7c9]">
          {names?.one}
          <span className="block text-[0.5em] text-[#c9a45a]">&amp;</span>
          {names?.two}
        </p>
        <p className="mt-4 text-[0.62rem] tracking-[0.3em] text-[#d9bf86] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-sm">
          {s("theatreInvite", locale)}
        </p>
        <p className="mt-4 text-[0.8rem] tracking-[0.28em] text-[#f1e4c8] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">
          {dateLabel}
        </p>
        {place && <p className="mt-1 text-[0.7rem] tracking-[0.2em] text-[#b9a47a] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">{place}</p>}
        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          className="relative z-10 mt-10 border border-[#c9a45a] px-7 py-3 text-[0.7rem] tracking-[0.26em] text-[#f1e4c8] uppercase transition hover:bg-[#c9a45a] hover:text-[#2a140d] [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case"
        >
          {s("theatreEnter", locale)}
        </button>
      </div>

      {curtain("left")}
      {curtain("right")}
      {/* the valance across the top */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[7%] border-b-2 border-[#c9a45a]/70 shadow-[0_8px_18px_rgba(0,0,0,.5)]"
        style={{ backgroundImage: VELVET, backgroundBlendMode: "multiply" }}
      />
    </div>
  );
}

/* ── Shutters ───────────────────────────────────────────────── */

function ShutterDoor({ side, opening }: { side: "left" | "right"; opening: boolean }) {
  const left = side === "left";
  return (
    <div
      aria-hidden
      className="tpl-planks absolute top-0 bottom-0 w-[47%] shadow-[inset_0_0_0_6px_#123a7a,inset_0_0_46px_rgba(0,0,0,.3),0_0_30px_rgba(0,0,0,.25)]"
      style={{
        [left ? "left" : "right"]: "3%",
        transformOrigin: left ? "left center" : "right center",
        transform: `perspective(1700px) rotateY(${opening ? (left ? -104 : 104) : 0}deg)`,
        transition: "transform 1.8s cubic-bezier(.45,0,.2,1)",
      }}
    >
      {/* brass hinges on the outer edge */}
      {[10, 50, 90].map((top) => (
        <span
          key={top}
          className="absolute h-[7%] w-[9%] rounded-sm bg-gradient-to-b from-[#e7c777] to-[#a8802f] shadow"
          style={{ top: `${top}%`, [left ? "left" : "right"]: 0 }}
        />
      ))}
      {/* the handle, on the inner edge */}
      <svg viewBox="0 0 40 90" className="absolute top-1/2 h-[16%] -translate-y-1/2" style={{ [left ? "right" : "left"]: "6%" }}>
        <defs>
          <linearGradient id={`brass-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d98f" />
            <stop offset="1" stopColor="#a8802f" />
          </linearGradient>
        </defs>
        <path d="M12 8h16v50l8 18" fill="none" stroke={`url(#brass-${side})`} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="6" fill={`url(#brass-${side})`} />
      </svg>
    </div>
  );
}

function ShuttersFace({
  opening,
  onOpen,
  locale,
  monogram,
  names,
  dateLabel,
  place,
}: {
  opening: boolean;
  onOpen: () => void;
  locale: Locale;
  monogram: string;
  names?: { one: string; two: string };
  dateLabel: string;
  place?: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f6f1e8]">
      {/* the view behind the shutters: sun, sky and sea */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#eaf4fb,#c4dff1_55%,#8fbde0_55%,#6aa3d2)]" />
      <div aria-hidden className="absolute top-[18%] left-1/2 size-[38vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fffef2,rgba(255,250,220,0)_70%)]" />
      <div className="absolute inset-x-0 top-[26%] px-6 text-center text-[#1e4f9c]">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-sm">{s("shuttersWelcome", locale)}</p>
        <p className="tpl-script mt-3 text-[clamp(2.8rem,10vw,4.8rem)]">
          {names?.one}
          <span className="mx-[0.25em] text-[0.6em] text-[#d9487a]">&amp;</span>
          {names?.two}
        </p>
        <p className="mt-4 text-[0.8rem] tracking-[0.24em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">{dateLabel}</p>
        {place && <p className="mt-1 text-[0.7rem] tracking-[0.18em] text-[#6f819f] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">{place}</p>}
        <span className="sr-only">{monogram}</span>
      </div>

      {/* whitewashed wall either side of the doors */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-[3%] bg-[#f6f1e8]" />
      <div aria-hidden className="absolute inset-y-0 right-0 w-[3%] bg-[#f6f1e8]" />

      <button
        type="button"
        onClick={onOpen}
        disabled={opening}
        aria-label={s("openInvitation", locale)}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-white"
      >
        <ShutterDoor side="left" opening={opening} />
        <ShutterDoor side="right" opening={opening} />
        <span
          className="absolute inset-x-0 bottom-[9%] text-center text-[0.72rem] tracking-[0.28em] text-white/90 uppercase transition-opacity duration-500 [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-sm"
          style={{ opacity: opening ? 0 : 1 }}
        >
          {s("tapToOpenShutters", locale)}
        </span>
      </button>
    </div>
  );
}

/* ── Silk ───────────────────────────────────────────────────── */

const SILK =
  "linear-gradient(112deg,rgba(255,255,255,.42) 0 7%,transparent 17% 29%,rgba(255,255,255,.3) 37%,transparent 49% 60%,rgba(255,255,255,.36) 69%,transparent 81% 100%)," +
  "linear-gradient(76deg,rgba(176,128,106,.3) 0 9%,transparent 23% 39%,rgba(176,128,106,.22) 51%,transparent 65% 79%,rgba(176,128,106,.26) 89%,transparent 100%)," +
  "linear-gradient(180deg,#ebcbb9,#d6a891)";

/** A drape of blush silk with the names on it. It lifts away when the guest enters. */
function SilkFace({
  opening,
  onOpen,
  locale,
  names,
  dateLabel,
  place,
}: {
  opening: boolean;
  onOpen: () => void;
  locale: Locale;
  names?: { one: string; two: string };
  dateLabel: string;
  place?: string;
}) {
  return (
    <div
      className="relative grid h-full w-full place-items-center px-6 text-center text-[#fff8f1]"
      style={{
        backgroundImage: SILK,
        transform: opening ? "translateY(-104%)" : "translateY(0)",
        transition: "transform 1.2s cubic-bezier(.65,0,.3,1)",
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(255,255,255,.28),transparent_70%)]" />
      <div className="relative [text-shadow:0_1px_12px_rgba(110,66,48,.6)]">
        <p className="text-[clamp(2.2rem,8vw,3.6rem)] leading-[1.15] tracking-[0.08em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          {names?.one}
        </p>
        <p className="my-1 text-[1.1rem] italic" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          {s("and", locale)}
        </p>
        <p className="text-[clamp(2.2rem,8vw,3.6rem)] leading-[1.15] tracking-[0.08em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          {names?.two}
        </p>
        <p className="mt-8 text-[0.75rem] tracking-[0.26em] uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">{dateLabel}</p>
        {place && <p className="mt-1 text-[0.7rem] tracking-[0.2em] opacity-90 uppercase [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case">{place}</p>}
        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#7b8c6c] px-9 py-3.5 text-[0.72rem] tracking-[0.24em] text-white uppercase shadow-[0_12px_26px_-12px_rgba(70,90,60,.9)] transition hover:bg-[#5f6f52] [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-sm"
        >
          {s("enter", locale)} <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
