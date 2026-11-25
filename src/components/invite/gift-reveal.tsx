"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const far = i % 2 === 0 ? 1 : 0.7;
  // rounded so the server and the browser render identical numbers
  return { x: +(Math.cos(a) * 96 * far).toFixed(1), y: +(Math.sin(a) * 74 * far - 26).toFixed(1), r: i % 3 === 0 ? 7 : 5 };
});

/** A four-point sparkle centred on the origin. */
const star = (r: number) => `M0 ${-r} C${r * 0.15} ${-r * 0.15} ${r * 0.15} ${-r * 0.15} ${r} 0 C${r * 0.15} ${r * 0.15} ${r * 0.15} ${r * 0.15} 0 ${r} C${-r * 0.15} ${r * 0.15} ${-r * 0.15} ${r * 0.15} ${-r} 0 C${-r * 0.15} ${-r * 0.15} ${-r * 0.15} ${-r * 0.15} 0 ${-r}Z`;

/**
 * Keeps the gift QR codes tucked inside a gift box. A tap lifts the lid, a burst of sparkles
 * flies out, and the QR cards rise up where the box was. Without motion (or with reduced
 * motion) the tap simply shows the cards.
 */
export function GiftReveal({ hint, children }: { hint: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");

  useEffect(() => {
    if (phase !== "opening") return;
    const id = window.setTimeout(() => setPhase("open"), 1250);
    return () => window.clearTimeout(id);
  }, [phase]);

  const opening = phase === "opening";

  return (
    <div className="mt-8">
      <AnimatePresence initial={false} mode="wait">
        {phase !== "open" ? (
          <motion.button
            key="box"
            type="button"
            aria-expanded={false}
            aria-label={hint}
            onClick={() => (reduce ? setPhase("open") : setPhase((p) => (p === "closed" ? "opening" : p)))}
            exit={{ opacity: 0, scale: 0.92, y: 10, transition: { duration: 0.45, ease: EASE } }}
            className="group mx-auto block cursor-pointer text-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[color:var(--gold-deep,#8a6d3f)]"
          >
            <motion.svg
              viewBox="0 0 240 220"
              className="mx-auto block w-[min(16rem,70vw)] overflow-visible"
              animate={!opening && !reduce ? { y: [0, -7, 0] } : { y: 0 }}
              transition={!opening && !reduce ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              aria-hidden
            >
              <defs>
                <linearGradient id="gift-body" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6cf99" />
                  <stop offset="0.55" stopColor="#c9a762" />
                  <stop offset="1" stopColor="#a8834c" />
                </linearGradient>
                <linearGradient id="gift-lid" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#efdcab" />
                  <stop offset="1" stopColor="#bd9755" />
                </linearGradient>
                <linearGradient id="gift-ribbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fbf4e1" />
                  <stop offset="1" stopColor="#e9d9b3" />
                </linearGradient>
                <radialGradient id="gift-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
                </radialGradient>
              </defs>

              <ellipse cx="120" cy="208" rx="86" ry="9" fill="#4f3e31" opacity="0.16" />

              {/* light that spills out when the lid lifts */}
              <motion.ellipse
                cx="120"
                cy="104"
                rx="92"
                ry="40"
                fill="url(#gift-glow)"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={opening ? { opacity: 1, scale: 1.25 } : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.9, ease: EASE }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              />

              {/* box */}
              <rect x="40" y="104" width="160" height="96" rx="9" fill="url(#gift-body)" />
              <rect x="108" y="104" width="24" height="96" fill="url(#gift-ribbon)" opacity="0.95" />
              <path d="M40 124 H200" stroke="#fff6dc" strokeOpacity="0.35" strokeWidth="1.5" />

              {/* sparkles */}
              {SPARKS.map((p, i) => (
                <motion.path
                  key={i}
                  d={star(p.r)}
                  fill="#e8c978"
                  initial={{ opacity: 0, scale: 0, x: 120, y: 96 }}
                  animate={opening ? { opacity: [0, 1, 0], scale: [0, 1.2, 0.5], x: 120 + p.x, y: 96 + p.y } : { opacity: 0, scale: 0, x: 120, y: 96 }}
                  transition={{ duration: 1.15, delay: 0.25 + (i % 5) * 0.05, ease: EASE }}
                />
              ))}

              {/* lid with the bow */}
              <motion.g
                animate={opening ? { y: -62, rotate: -14, x: -14 } : { y: 0, rotate: 0, x: 0 }}
                transition={{ duration: 0.85, ease: EASE }}
                style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
              >
                <rect x="30" y="76" width="180" height="34" rx="8" fill="url(#gift-lid)" />
                <rect x="108" y="76" width="24" height="34" fill="url(#gift-ribbon)" />
                <path d="M120 76 C96 40 62 52 82 74 C96 82 112 78 120 76Z" fill="#f4e7c3" stroke="#b8924a" strokeWidth="1.5" />
                <path d="M120 76 C144 40 178 52 158 74 C144 82 128 78 120 76Z" fill="#f4e7c3" stroke="#b8924a" strokeWidth="1.5" />
                <circle cx="120" cy="76" r="9" fill="#d3b36f" stroke="#b8924a" strokeWidth="1.5" />
              </motion.g>
            </motion.svg>

            <motion.span
              className="label-caps mt-4 block text-[color:var(--navy,#4f3e31)]"
              animate={opening ? { opacity: 0, y: 6 } : reduce ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
              transition={opening || reduce ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {hint}
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="cards"
            initial={reduce ? false : { opacity: 0, y: 46, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
