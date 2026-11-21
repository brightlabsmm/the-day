/*
 * Decorative watercolour wildflowers, drawn in code (no image files). The
 * shapes are random but seeded, so the server and the browser draw the same
 * picture every time.
 */
import type { ReactNode } from "react";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLOOMS = ["#f1b5a5", "#f6d2c3", "#a9bbe0", "#f3d37b", "#fbe3da", "#c9b7e0"];
const LEAF = "#9fb08a";
const STEM = "#8fa07c";

function garland(side: "left" | "right", seed: number, h: number, blooms: string[] = BLOOMS): ReactNode[] {
  const r = rng(seed);
  const dir = side === "left" ? 1 : -1;
  const baseX = side === "left" ? 30 : 270;
  const out: ReactNode[] = [];
  let y = 34;
  let i = 0;
  // the main stem sways down the side
  const pts: [number, number][] = [];
  for (let yy = 20; yy <= h - 20; yy += 20) pts.push([baseX + Math.sin(yy / 52 + seed) * 7 * dir, yy]);
  out.push(<path key="stem" d={`M${pts.map((p) => p.join(" ")).join(" L")}`} stroke={STEM} strokeWidth="1.3" fill="none" opacity=".8" />);

  while (y < h - 30) {
    const x = baseX + Math.sin(y / 52 + seed) * 7 * dir;
    const out_ = (r() > 0.5 ? 1 : -1) * dir; // branch outward or inward
    const inward = out_ === dir;
    const len = inward ? 12 + r() * 14 : 24 + r() * 34; // keep inward blooms off the text
    const ex = x + out_ * len;
    const ey = y - 8 - r() * 14;
    out.push(<path key={`b${i}`} d={`M${x} ${y} Q${x + out_ * len * 0.5} ${y - 4} ${ex} ${ey}`} stroke={STEM} strokeWidth="1" fill="none" opacity=".75" />);
    // leaves along the branch
    out.push(<ellipse key={`l${i}`} cx={x + out_ * len * 0.45} cy={y - 7} rx="7" ry="2.6" fill={LEAF} opacity=".7" transform={`rotate(${out_ * -28} ${x + out_ * len * 0.45} ${y - 7})`} />);
    // the blossom: a ring of petals around a centre
    const colour = blooms[Math.floor(r() * blooms.length)];
    const petals = 5;
    const pr = 4.6 + r() * 4.2;
    for (let p = 0; p < petals; p++) {
      const a = (p / petals) * Math.PI * 2 + r();
      out.push(<circle key={`p${i}-${p}`} cx={ex + Math.cos(a) * pr} cy={ey + Math.sin(a) * pr} r={pr * 0.85} fill={colour} opacity=".78" />);
    }
    out.push(<circle key={`c${i}`} cx={ex} cy={ey} r={pr * 0.45} fill={r() > 0.5 ? "#e8b25a" : "#fff4e6"} opacity=".9" />);
    // a bud on the stem
    if (r() > 0.55) out.push(<circle key={`bud${i}`} cx={x - out_ * 5} cy={y + 8} r={2.4 + r() * 2} fill={blooms[Math.floor(r() * blooms.length)]} opacity=".7" />);
    y += 17 + r() * 15;
    i++;
  }
  return out;
}

/** Two garlands, one down each side, to sit around a framed area. */
export function WildflowerBorder({ seed = 3, height = 640, blooms }: { seed?: number; height?: number; blooms?: string[] }) {
  return (
    <svg aria-hidden viewBox={`0 0 300 ${height}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <defs>
        <filter id={`wc-${seed}`}>
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
      </defs>
      <g filter={`url(#wc-${seed})`}>
        {garland("left", seed, height, blooms)}
        {garland("right", seed + 11, height, blooms)}
      </g>
    </svg>
  );
}

/** A small peach on a leafy twig. */
export function Peach({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 80 90" className={className}>
      <defs>
        <radialGradient id="peach" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f9cdbd" />
          <stop offset="1" stopColor="#e8998a" />
        </radialGradient>
      </defs>
      <path d="M40 22C34 8 18 8 10 18c12 2 22 4 30 4Z" fill={LEAF} opacity=".8" />
      <path d="M40 22C48 6 64 6 72 16c-12 3-22 5-32 6Z" fill="#b7c6a0" opacity=".85" />
      <path d="M40 24v-8" stroke={STEM} strokeWidth="1.4" />
      <path d="M40 78C20 78 10 62 14 46c3-12 14-20 26-16 12-4 23 4 26 16 4 16-6 32-26 32Z" fill="url(#peach)" />
      <path d="M40 32c-4 14-4 30 0 44" stroke="#d98577" strokeOpacity=".5" fill="none" />
    </svg>
  );
}
