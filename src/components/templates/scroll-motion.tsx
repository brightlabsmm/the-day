"use client";

/*
 * Scroll motion for invitation pages, built on motion/react.
 *
 * Every effect is reversible: entrances play when a block scrolls into view
 * and play backwards when it scrolls out again (viewport once: false), and
 * the parallax pieces are tied directly to scroll position. Only opacity and
 * transforms animate (no layout properties), and <MotionConfig
 * reducedMotion="user"> in ScrollMotionRoot turns movement off for anyone who
 * prefers reduced motion; they still get a gentle fade.
 */
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ScrollMotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/** Rises and fades in as it enters the viewport; sinks and fades out as it leaves. */
export function InView({
  children,
  className,
  delay = 0,
  amount = 0.18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** How much of the block must be visible before it plays (0–1). */
  amount?: number;
  as?: "div" | "section" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount }}
      variants={rise}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

/** Container whose <StaggerItem> children enter one after another. */
export function Stagger({
  children,
  className,
  gap = 0.09,
  amount = 0.25,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  amount?: number;
  as?: "div" | "ul";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  from = "below",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "span";
  from?: "below" | "left" | "right" | "scale";
}) {
  const Tag = motion[as];
  const hidden =
    from === "left" ? { opacity: 0, x: -36 } : from === "right" ? { opacity: 0, x: 36 } : from === "scale" ? { opacity: 0, scale: 0.86 } : { opacity: 0, y: 28 };
  return (
    <Tag
      className={className}
      variants={{ hidden, show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.75, ease: EASE } } }}
    >
      {children}
    </Tag>
  );
}

/** Scroll progress of an element across the viewport: 0 as it enters at the bottom, 1 as it leaves at the top. */
export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return { ref, progress: scrollYProgress };
}

/** Moves its content against the scroll by up to `distance` px, for depth. */
export function Parallax({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const { ref, progress } = useSectionProgress<HTMLDivElement>();
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Maps a progress value to a range, but holds still for reduced motion. */
export function useScrollRange(progress: MotionValue<number>, input: number[], output: number[]) {
  const reduce = useReducedMotion();
  return useTransform(progress, input, reduce ? output.map(() => output[output.length - 1]) : output);
}
