/**
 * Hand-drawn line illustrations for the Blue Ribbon design, drawn in code (single strokes in the
 * current text colour, so a parent just sets `color`). They are our own drawings in the same spirit
 * as the reference, not copies of its artwork.
 */
import type { SVGProps } from "react";

const base = (w: number): SVGProps<SVGSVGElement> => ({
  fill: "none",
  stroke: "currentColor",
  strokeWidth: w,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
});

/** A coupe glass, centred on x=0 with its rim at y=0. */
function Coupe({ bow = false }: { bow?: boolean }) {
  return (
    <g>
      <ellipse pathLength={1} cx="0" cy="0" rx="34" ry="8" />
      <path pathLength={1} d="M-34 1 C-33 30 -14 42 0 42 C14 42 33 30 34 1" />
      <path pathLength={1} d="M-26 8 C-24 22 -14 30 -4 33" opacity=".55" />
      <path pathLength={1} d="M0 42 L0 92" />
      <path pathLength={1} d="M-18 98 C-12 90 12 90 18 98 C10 104 -10 104 -18 98 Z" />
      {bow && (
        <g transform="translate(0 70)">
          <path pathLength={1} d="M0 0 C-14 -12 -26 -4 -22 6 C-18 14 -6 8 0 0 C6 8 18 14 22 6 C26 -4 14 -12 0 0 Z" />
          <path pathLength={1} d="M-2 2 C-10 16 -18 26 -26 40" />
          <path pathLength={1} d="M2 2 C10 16 14 30 24 44" />
        </g>
      )}
    </g>
  );
}

/** Two coupe glasses tied with a ribbon, touching at the rim. */
export function Glasses(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 170 150" overflow="visible" {...base(2.6)} {...props}>
      <g transform="translate(58 22) rotate(-9)">
        <g className="rb-glass-l">
          <Coupe />
        </g>
      </g>
      <g transform="translate(112 22) rotate(9)">
        <g className="rb-glass-r">
          <Coupe />
        </g>
      </g>
      <g className="rb-spark" strokeWidth="2.2">
        <path d="M85 4 V-6 M70 10 L62 2 M100 10 L108 2 M52 16 L42 12 M118 16 L128 12" />
      </g>
      <g transform="translate(85 84)">
        <path pathLength={1} d="M0 0 C-16 -14 -30 -6 -25 7 C-20 16 -6 10 0 0 C7 10 21 16 26 7 C31 -6 17 -14 0 0 Z" />
        <path pathLength={1} d="M-3 3 C-12 22 -22 34 -34 50" />
        <path pathLength={1} d="M3 3 C12 22 18 38 30 54" />
      </g>
    </svg>
  );
}

/** Two flutes clinking, with sparkles. */
export function Champagne(props: SVGProps<SVGSVGElement>) {
  const flute = (
    <g>
      <path pathLength={1} d="M-11 0 L-9 46 C-8 56 8 56 9 46 L11 0 Z" />
      <path pathLength={1} d="M-8 18 L8 18" opacity=".6" />
      <path pathLength={1} d="M0 54 L0 92" />
      <path pathLength={1} d="M-15 98 C-8 90 8 90 15 98 C8 103 -8 103 -15 98 Z" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 140" {...base(2.4)} {...props}>
      <g transform="translate(40 34) rotate(-14)">{flute}</g>
      <g transform="translate(82 34) rotate(14)">{flute}</g>
      <path pathLength={1} d="M60 6 V-2 M48 12 L42 4 M72 12 L78 4 M26 8 L20 2 M96 8 L102 2" transform="translate(0 6)" />
    </svg>
  );
}

/** A small chapel. */
export function Church(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 130 150" {...base(2.4)} {...props}>
      <path pathLength={1} d="M65 4 V22 M57 12 H73" />
      <path pathLength={1} d="M65 22 L50 52 H80 Z" />
      <path pathLength={1} d="M44 52 H86 V76" />
      <path pathLength={1} d="M10 92 L44 76 H86 L120 92" />
      <path pathLength={1} d="M16 92 V142 H114 V92" />
      <path pathLength={1} d="M50 142 V108 C50 98 80 98 80 108 V142" />
      <path pathLength={1} d="M65 100 V142" />
      <path pathLength={1} d="M26 104 C26 98 36 98 36 104 V124 H26 Z" />
      <path pathLength={1} d="M94 104 C94 98 104 98 104 104 V124 H94 Z" />
      <path pathLength={1} d="M58 62 C58 58 72 58 72 62 V70 H58 Z" />
    </svg>
  );
}

/** A bride and groom dancing. */
export function Dancers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 150 190" {...base(2.4)} {...props}>
      {/* groom */}
      <circle pathLength={1} cx="98" cy="30" r="12" />
      <path pathLength={1} d="M92 20 C96 14 108 16 110 24" />
      <path pathLength={1} d="M90 44 L84 88 L96 150 M110 46 L116 90 L108 152" />
      <path pathLength={1} d="M90 44 C96 52 104 52 110 46" />
      <path pathLength={1} d="M96 56 L98 80 L102 56" />
      {/* arm raised */}
      <path pathLength={1} d="M110 50 C122 42 128 30 122 16" />
      <path pathLength={1} d="M118 16 C122 10 126 12 126 18" />
      {/* bride */}
      <circle pathLength={1} cx="58" cy="46" r="11" />
      <path pathLength={1} d="M46 40 C44 30 56 26 66 32 C72 36 70 42 68 44" />
      <path pathLength={1} d="M56 58 C54 70 48 80 38 96 C20 124 14 150 22 168 C50 182 84 182 108 170 C104 140 90 110 74 92 C66 80 62 70 62 58" />
      <path pathLength={1} d="M34 112 C50 122 70 124 90 118 M30 138 C52 148 80 150 100 142" opacity=".6" />
      <path pathLength={1} d="M62 62 C74 66 84 62 90 52" />
    </svg>
  );
}

/** A pair of bow-trimmed heels. */
export function Shoes(props: SVGProps<SVGSVGElement>) {
  const pump = (
    <g>
      <path pathLength={1} d="M4 6 C6 34 24 52 54 50 C80 48 100 36 118 26 C108 46 84 64 54 66 C30 68 12 58 6 40" />
      <path pathLength={1} d="M4 6 C12 4 20 6 26 12 C34 30 46 38 62 38" />
      <path pathLength={1} d="M10 46 L6 92 L16 92 L28 54" />
      <path pathLength={1} d="M92 36 C86 28 78 30 80 38 C82 44 90 42 92 36 Z M92 36 C98 28 106 32 102 40 C98 46 92 42 92 36 Z" />
    </g>
  );
  return (
    <svg viewBox="0 0 190 100" {...base(2.4)} {...props}>
      <g transform="translate(2 2) rotate(-6 60 50)">{pump}</g>
      <g transform="translate(188 4) scale(-1 1) rotate(-6 60 50)">{pump}</g>
    </svg>
  );
}

/** A plate with a fork and a knife. */
export function Plate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 190 130" {...base(2.4)} {...props}>
      <ellipse pathLength={1} cx="95" cy="68" rx="58" ry="52" />
      <ellipse pathLength={1} cx="95" cy="68" rx="42" ry="37" />
      <path pathLength={1} d="M66 62 C80 52 108 52 124 64 C112 80 80 82 66 62 Z" />
      <path pathLength={1} d="M18 10 V44 C18 54 30 54 30 44 V10 M24 10 V120 M18 24 H30" />
      <path pathLength={1} d="M168 8 C158 28 158 52 166 70 H172 V122" />
    </svg>
  );
}

/** A wedding car seen from behind, with a heart in the window, a "Just married" plate and flowers. */
export function Car(props: SVGProps<SVGSVGElement>) {
  const bloom = (x: number, y: number, r = 11) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      <circle pathLength={1} cx="0" cy={-r * 0.3} r={r * 0.62} />
      <circle pathLength={1} cx={r * 0.7} cy={r * 0.2} r={r * 0.62} />
      <circle pathLength={1} cx={-r * 0.7} cy={r * 0.2} r={r * 0.62} />
      <circle pathLength={1} cx="0" cy={r * 0.55} r={r * 0.5} />
      <circle pathLength={1} cx="0" cy="0" r={r * 0.28} />
    </g>
  );
  return (
    <svg viewBox="0 0 380 300" {...base(5)} {...props}>
      {/* roof and rear window */}
      <path pathLength={1} d="M104 132 C104 66 146 22 190 22 C234 22 276 66 276 132" />
      <path pathLength={1} d="M128 124 C130 80 156 48 190 48 C224 48 250 80 252 124 Z" />
      <path pathLength={1} className="rb-heart" d="M190 100 C176 82 156 90 162 106 C166 116 182 122 190 130 C198 122 214 116 218 106 C224 90 204 82 190 100 Z" strokeWidth="4" />
      {/* body with the rounded shoulders over the wheels */}
      <path pathLength={1} d="M70 232 C56 190 70 138 118 130 C160 126 220 126 262 130 C310 138 324 190 310 232" />
      <path pathLength={1} d="M84 150 C100 140 120 140 130 148 M296 150 C280 140 260 140 250 148" strokeWidth="3.5" opacity=".7" />
      {/* the plate */}
      <rect pathLength={1} x="138" y="164" width="104" height="52" rx="9" />
      <path pathLength={1} d="M152 188 C160 176 168 196 178 184 C186 176 192 196 202 184 M158 204 C172 196 184 208 200 200 C212 196 222 204 230 198" strokeWidth="3.5" />
      {/* wheels */}
      <rect pathLength={1} x="78" y="230" width="38" height="52" rx="14" />
      <rect pathLength={1} x="264" y="230" width="38" height="52" rx="14" />
      {/* bumper */}
      <path pathLength={1} d="M52 236 C100 246 280 246 328 236" />
      {/* a garland of flowers along the bumper */}
      {[70, 118, 168, 216, 266, 314].map((x, i) => bloom(x, 252 + (i % 2) * 4, 12))}
      <path pathLength={1} d="M94 262 C100 272 112 270 116 262 M190 266 C196 276 208 274 212 266 M290 262 C296 272 308 270 312 262" strokeWidth="3.5" />
    </svg>
  );
}

/** A big hand-drawn bow. */
export function Bow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 260 210" {...base(5)} {...props}>
      <path pathLength={1} d="M130 62 C100 20 40 8 14 38 C-4 62 30 108 130 76 C230 108 264 62 246 38 C220 8 160 20 130 62 Z" />
      <path pathLength={1} d="M130 62 C100 38 62 34 40 46 M130 62 C160 38 198 34 220 46" strokeWidth="3.5" opacity=".7" />
      <circle pathLength={1} cx="130" cy="68" r="14" />
      <path pathLength={1} d="M118 80 C104 110 92 150 70 196 L96 188 L110 202 C122 160 132 122 138 82" />
      <path pathLength={1} d="M142 80 C158 112 170 150 190 198 L168 190 L152 204 C142 160 136 122 134 84" />
    </svg>
  );
}

/** The wobbly oval outline behind a cover button. */
export function PillOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" {...base(1.6)} {...props}>
      <path pathLength={1} d="M12 10 C60 2 140 4 188 10 C198 14 198 44 188 50 C140 58 60 58 12 50 C2 44 2 16 12 10 Z" vectorEffect="non-scaling-stroke" />
      <path pathLength={1} d="M10 14 C58 6 138 8 186 13" vectorEffect="non-scaling-stroke" opacity=".6" />
    </svg>
  );
}
