/*
 * Original watercolour-style illustration tiles, drawn as SVG so every design
 * can mix them in among the couple's photos. A turbulence filter wobbles the
 * edges so the shapes read as painted rather than vector.
 */
import { useId } from "react";

export type ArtKind = "sea" | "bloom" | "dusk" | "night";

export function Artwork({ kind, className = "" }: { kind: ArtKind; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const wc = `wc${uid}`;
  const soft = `sf${uid}`;
  return (
    <svg aria-hidden viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <filter id={wc} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="12" />
          <feGaussianBlur stdDeviation=".7" />
        </filter>
        <filter id={soft} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={kind === "night" ? "#17224a" : kind === "dusk" ? "#f7d9bf" : "#cfe3f3"} />
          <stop offset="1" stopColor={kind === "night" ? "#3b4d8c" : kind === "dusk" ? "#fbeee0" : "#f6f1e6"} />
        </linearGradient>
        <linearGradient id={`water${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb8da" />
          <stop offset="1" stopColor="#5c8fc0" />
        </linearGradient>
      </defs>
      <rect width="300" height="360" fill={`url(#sky${uid})`} />
      {kind === "sea" && (
        <g filter={`url(#${wc})`}>
          <circle cx="226" cy="84" r="34" fill="#fff6dc" opacity=".9" filter={`url(#${soft})`} />
          <path d="M-10 190 L40 132 L78 168 L124 108 L176 176 L214 140 L262 186 L310 150 V230 H-10Z" fill="#9fb4cf" opacity=".75" />
          <path d="M-10 214 L52 168 L96 202 L150 156 L206 208 L262 170 L310 204 V250 H-10Z" fill="#7d98bd" opacity=".8" />
          <rect x="-10" y="226" width="320" height="140" fill={`url(#water${uid})`} />
          <g stroke="#e8f2fb" strokeWidth="2.2" strokeLinecap="round" opacity=".75">
            <path d="M20 262h58M110 278h74M214 258h56M60 300h66M170 312h86M24 336h48" />
          </g>
          <path d="M148 250 L148 196 L198 246Z" fill="#fffdf8" />
          <path d="M142 250 L142 206 L110 246Z" fill="#f1ebdf" />
          <path d="M104 254 H206 L194 270 H118Z" fill="#cdb894" />
        </g>
      )}
      {kind === "bloom" && (
        <g filter={`url(#${wc})`}>
          <circle cx="90" cy="110" r="90" fill="#f6d7cb" opacity=".7" filter={`url(#${soft})`} />
          <circle cx="230" cy="250" r="100" fill="#d8e2c0" opacity=".7" filter={`url(#${soft})`} />
          <g stroke="#7f9167" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M70 360 C74 290 60 240 80 170" />
            <path d="M150 360 C146 300 170 250 160 190" />
            <path d="M230 360 C236 300 220 270 240 210" />
          </g>
          <g fill="#9fb184">
            <path d="M78 270 C50 262 40 238 56 226 C74 232 82 250 78 270Z" />
            <path d="M160 300 C186 292 198 268 184 256 C164 262 156 280 160 300Z" />
            <path d="M232 290 C206 284 196 262 210 252 C228 258 236 274 232 290Z" />
          </g>
          {[[80, 160, 24, "#f1a897"], [160, 182, 28, "#f6cdbd"], [240, 200, 22, "#e9b5c8"], [118, 232, 16, "#f3d37b"]].map(([x, y, r, c], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {Array.from({ length: 6 }, (_, k) => (
                <ellipse key={k} cx="0" cy={-Number(r) * 0.62} rx={Number(r) * 0.5} ry={Number(r) * 0.75} fill={String(c)} opacity=".85" transform={`rotate(${k * 60})`} />
              ))}
              <circle r={Number(r) * 0.28} fill="#f3d37b" />
            </g>
          ))}
        </g>
      )}
      {kind === "dusk" && (
        <g filter={`url(#${wc})`}>
          <circle cx="150" cy="150" r="64" fill="#f5b998" opacity=".9" filter={`url(#${soft})`} />
          <circle cx="150" cy="150" r="46" fill="#f7c9a8" />
          <path d="M-10 236 C50 196 100 220 150 200 C210 176 260 214 310 190 V360 H-10Z" fill="#d9bfa6" />
          <path d="M-10 270 C60 236 120 266 180 244 C230 226 270 252 310 240 V360 H-10Z" fill="#b9a089" />
          <path d="M-10 308 C70 284 130 312 200 296 C250 284 280 300 310 296 V360 H-10Z" fill="#8f7b68" />
        </g>
      )}
      {kind === "night" && (
        <g filter={`url(#${wc})`}>
          <circle cx="200" cy="100" r="40" fill="#f3e2b0" opacity=".85" filter={`url(#${soft})`} />
          <circle cx="200" cy="100" r="28" fill="#f7e9bf" />
          <circle cx="212" cy="92" r="26" fill="#2c3b78" />
          {[[50, 60, 3], [90, 130, 2], [140, 50, 2.6], [60, 200, 2], [250, 190, 3], [120, 250, 2.4], [230, 270, 2], [30, 290, 2.4]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fff4d0" />
          ))}
          <path d="M-10 330 C60 290 110 316 170 296 C230 276 270 304 310 288 V360 H-10Z" fill="#0e1738" />
        </g>
      )}
      <rect width="300" height="360" fill="none" stroke="#000" strokeOpacity=".06" />
    </svg>
  );
}
