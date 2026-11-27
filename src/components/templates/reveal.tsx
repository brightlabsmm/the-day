"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/** Entrances that are slow enough to also play for pieces already on screen when the page opens. */
const SLOW = new Set(["drift", "slide-left", "slide-right", "drop", "circle", "spin", "zoom", "wipe", "flip"]);

/**
 * Fades and lifts its content in each time it scrolls into view, going down or up. Content
 * is fully visible until the script runs, and for people who prefer reduced
 * motion, so nothing is ever hidden without JavaScript.
 */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  className,
  style: boxStyle,
}: {
  children: ReactNode;
  /** Milliseconds to wait once it is on screen, to stagger neighbours. */
  delay?: number;
  /** `up` lifts, `left`/`right` slide in from that side, `photo` rises and settles from slightly larger. */
  variant?: "up" | "left" | "right" | "photo" | "arch" | "drift" | "slide-left" | "slide-right" | "drop" | "circle" | "spin" | "zoom" | "wipe" | "flip";
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScreen = el.getBoundingClientRect().top < window.innerHeight;
    // Slow pieces also play when the page opens; the others simply stay put until they are first scrolled away.
    const timers: number[] = [];
    if (SLOW.has(variant)) {
      timers.push(window.setTimeout(() => setState("hidden"), 0));
      if (onScreen) timers.push(window.setTimeout(() => setState("shown"), 120));
    }
    // It plays every time it scrolls into view, going down or up, and resets once it is fully out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState("shown");
        else setState("hidden");
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      io.disconnect();
    };
  }, [variant]);

  return (
    <Tag
      ref={ref}
      className={`tpl-reveal${className ? ` ${className}` : ""}`}
      data-state={state}
      data-variant={variant}
      style={delay ? { ...boxStyle, transitionDelay: `${delay}ms` } : boxStyle}
    >
      {children}
    </Tag>
  );
}
