/*
 * Hairline ornaments drawn after the inner cards of the printed invitation.
 * All are inline SVG using currentColor, so they inherit navy or gold.
 */

type Props = { className?: string };

/** Small centred scroll flourish, like the one under the card headings. */
export function Flourish({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 220 18"
      className={`h-[14px] w-[180px] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 9h62" opacity=".55" />
      <path d="M156 9h62" opacity=".55" />
      {/* left scroll */}
      <path d="M64 9c8 0 12-6 18-6s8 4 4 6-8-1-5-4" />
      <path d="M82 9c6 0 9 5 15 5 4 0 6-3 4-5" />
      {/* right scroll (mirrored) */}
      <path d="M156 9c-8 0-12-6-18-6s-8 4-4 6 8-1 5-4" />
      <path d="M138 9c-6 0-9 5-15 5-4 0-6-3-4-5" />
      {/* centre diamond */}
      <path d="M110 3.5 115.5 9 110 14.5 104.5 9Z" />
      <circle cx="110" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A single hairline rule with an optional centre diamond. */
export function Rule({ className = "", diamond = false }: Props & { diamond?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-current opacity-60" />
      {diamond && <span className="size-1.5 rotate-45 border border-current" />}
      {diamond && <span className="h-px flex-1 bg-current opacity-60" />}
    </div>
  );
}

/** Two parallel hairlines, as above and below "THE WEDDING DAY". */
export function DoubleRule({ className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-[3px] ${className}`} aria-hidden>
      <span className="h-px bg-current opacity-70" />
      <span className="h-px bg-current opacity-40" />
    </div>
  );
}

/** Round monogram seal: initials inside a thin double ring. */
export function MonogramSeal({ monogram, className = "" }: Props & { monogram: string }) {
  const [a, b] = monogram.split("&").map((s) => s.trim());
  return (
    <div
      className={`relative grid aspect-square place-items-center rounded-full ${className}`}
      aria-label={monogram}
      role="img"
    >
      <span className="absolute inset-0 rounded-full border border-current opacity-70" />
      <span className="absolute inset-[5px] rounded-full border border-current opacity-40" />
      <span className="font-display leading-none font-medium tracking-tight">
        {a}
        {b && (
          <>
            <span className="mx-[0.04em] align-[0.35em] text-[0.45em] italic">&amp;</span>
            {b}
          </>
        )}
      </span>
    </div>
  );
}
