"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { CardFace, SleeveFront, STAGE } from "./sleeve-parts";
import { GATE_OPENED_EVENT } from "./music-player";

type Props = {
  slug: string;
  token: string | null;
  locale: Locale;
  monogram: string;
  guestLabel: string;
  coupleNames: { one: string; two: string };
  onOpenAction: (slug: string, token: string) => Promise<void>;
  /** Showcase preview: ignore and never save the "already opened" flag. */
  preview?: boolean;
  children: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const storageKey = (slug: string) => `theday:opened:${slug}`;

/* Remembers, for this browser tab only, that the guest already opened the card. */
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

export function Opening({ slug, token, locale, monogram, guestLabel, coupleNames, onOpenAction, preview = false, children }: Props) {
  const reduceMotion = useReducedMotion();
  const openedBeforeStored = useOpenedThisSession(slug);
  const openedBefore = openedBeforeStored && !preview;
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const [scope, animate] = useAnimate();
  const [, startTransition] = useTransition();
  const isOpen = phase === "open" || openedBefore;

  // Keep the page behind the sleeve from scrolling until it is opened.
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

  const record = useCallback(() => {
    if (token) startTransition(() => onOpenAction(slug, token));
  }, [onOpenAction, slug, token]);

  const open = useCallback(async () => {
    if (phase !== "sealed") return;
    window.dispatchEvent(new Event(GATE_OPENED_EVENT));
    setPhase("opening");
    record();

    if (reduceMotion) {
      await animate(scope.current, { opacity: 0 }, { duration: 0.25 });
      return finish();
    }

    await animate("[data-seal]", { scale: [1, 0.9, 1.04], opacity: [1, 1, 0] }, { duration: 0.42, ease: EASE });
    await Promise.all([
      animate("[data-card]", { y: "-62%" }, { duration: 0.85, ease: EASE }),
      animate("[data-sleeve]", { y: "115%", opacity: 0.2 }, { duration: 0.75, ease: EASE, delay: 0.25 }),
      animate("[data-skip]", { opacity: 0 }, { duration: 0.2 }),
    ]);
    await animate(scope.current, { opacity: 0 }, { duration: 0.45, ease: "easeOut" });
    finish();
  }, [animate, finish, phase, record, reduceMotion, scope]);

  const skip = useCallback(() => {
    if (phase === "open") return;
    window.dispatchEvent(new Event(GATE_OPENED_EVENT));
    record();
    finish();
  }, [finish, phase, record]);

  return (
    <>
      <div inert={!isOpen} aria-hidden={!isOpen}>
        {children}
      </div>

      {!isOpen && (
        <div
          ref={scope}
          lang={locale}
          role="dialog"
          aria-modal="true"
          aria-label={s("openInvitation", locale)}
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-paper-deep px-4"
        >
          {/* soft light falling on the table */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_35%,rgba(255,250,240,.55),transparent_70%)]"
          />

          <button
            data-skip
            type="button"
            onClick={skip}
            className="label-caps absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 px-2 py-2 text-[0.625rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-navy"
          >
            {s("skip", locale)} ›
          </button>

          <div className="relative" style={{ width: STAGE.width, aspectRatio: STAGE.stageAspect }}>
            {/* the card, tucked in the sleeve */}
            <div data-card className="absolute inset-x-0 top-0" style={{ aspectRatio: STAGE.cardAspect }}>
              <CardFace
                monogram={monogram}
                title={s("theWeddingDay", locale)}
                names={{ ...coupleNames, and: s("and", locale), lang: locale }}
              />
            </div>

            {/* the sleeve */}
            <div data-sleeve className="absolute inset-x-0 bottom-0" style={{ aspectRatio: STAGE.cardAspect }}>
              <SleeveFront>
                <p lang={locale} className="label-caps text-[0.6rem] text-ink-soft [&:lang(my)]:tracking-normal [&:lang(my)]:normal-case [&:lang(my)]:text-xs">
                  {s("invitedLabel", locale)}
                </p>
                <p lang={locale} className="mt-4 text-[0.95rem] text-ink-soft italic [&:lang(my)]:not-italic">
                  {s("dear", locale)}
                </p>
                <h1
                  lang={locale}
                  className="font-display mt-0.5 text-[1.9rem] leading-tight font-medium text-navy [&:lang(my)]:text-[1.75rem]"
                >
                  {guestLabel}
                </h1>

                <motion.button
                  data-seal
                  type="button"
                  onClick={open}
                  disabled={phase !== "sealed"}
                  aria-label={s("openInvitation", locale)}
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  className="seal mt-auto grid size-[78px] place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
                >
                  <span className="seal-mark font-display text-[1.65rem] leading-none font-semibold">
                    {monogram.split("&")[0]}
                    <span className="align-[0.3em] text-[0.55em] italic">&amp;</span>
                    {monogram.split("&")[1] ?? ""}
                  </span>
                </motion.button>

                <p lang={locale} className="mt-3 text-[0.7rem] text-ink-soft [&:lang(en)]:font-label [&:lang(en)]:tracking-[0.12em] [&:lang(en)]:uppercase">
                  {s("tapToOpen", locale)}
                </p>
              </SleeveFront>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
