import type { ReactNode } from "react";

// A lantern-shaped (ogee) outline, drawn twice for the double line.
const OUTLINE =
  "M150 4C168 30 190 38 214 46C246 58 262 78 256 112C252 134 276 150 288 184C298 214 288 246 270 270C288 294 298 326 288 356C276 390 252 406 256 428C262 462 246 482 214 494C190 502 168 510 150 536C132 510 110 502 86 494C54 482 38 462 44 428C48 406 24 390 12 356C2 326 12 294 30 270C12 246 2 214 12 184C24 150 48 134 44 112C38 78 54 58 86 46C110 38 132 30 150 4Z";

/** Puts its content inside a scalloped double-line frame. */
export function OgeeFrame({ children, id, label, className = "" }: { children: ReactNode; id?: string; label?: string; className?: string }) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`relative mx-auto grid w-[min(92vw,26rem)] scroll-mt-20 place-items-center px-[15%] py-[17%] text-center ${className}`}
      style={{ aspectRatio: "300 / 540" }}
    >
      <svg aria-hidden viewBox="0 0 300 540" preserveAspectRatio="none" className="absolute inset-0 size-full text-[color:var(--gold-soft)]" fill="none" stroke="currentColor">
        <path d={OUTLINE} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
        <path d={OUTLINE} transform="translate(150 270) scale(.94) translate(-150 -270)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative w-full">{children}</div>
    </section>
  );
}
