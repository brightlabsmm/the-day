/**
 * Shown for the moment an invitation is loading, before we know its design or language: a calm cream screen
 * with the brand and a softly pulsing gold line. No words, so it suits Burmese and English guests, and no
 * design-specific shapes, so it looks right in front of every design.
 */
export function InviteLoading() {
  return (
    <div role="status" aria-label="Loading invitation" className="fixed inset-0 grid place-items-center bg-[#f7f1e8]">
      <div className="flex flex-col items-center gap-4">
        <span className="script text-[2.6rem] leading-none text-[#8a6d33]" style={{ fontFamily: "var(--font-script), cursive" }}>
          The Day
        </span>
        <span aria-hidden className="block h-px w-16 bg-[#b8913f] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
