"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Fades and lifts its content in the first time it scrolls into view. Content
 * is fully visible until the script runs, and for people who prefer reduced
 * motion, so nothing is ever hidden without JavaScript.
 */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  /** Milliseconds to wait once it is on screen, to stagger neighbours. */
  delay?: number;
  /** `up` lifts, `left`/`right` slide in from that side, `photo` rises and settles from slightly larger. */
  variant?: "up" | "left" | "right" | "photo";
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`tpl-reveal${className ? ` ${className}` : ""}`}
      data-state={state}
      data-variant={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
