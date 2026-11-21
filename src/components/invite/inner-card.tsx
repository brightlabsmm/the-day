/*
 * The inner cards of the printed invitation (pages 3 and 4): a thin
 * double-line border, a punched hole at the top, a centred heading and a
 * small scroll flourish beneath it.
 */
import type { ReactNode } from "react";
import { Flourish } from "@/components/ornaments";

export function InnerCard({
  id,
  heading,
  lang,
  children,
  plain = false,
  anchor,
}: {
  id: string;
  heading: string;
  lang: string;
  children: ReactNode;
  /** Page-designs other than "classic" show the same content without the paper card. */
  plain?: boolean;
  /** Element id for in-page navigation. */
  anchor?: string;
}) {
  if (plain) {
    return (
      <section id={anchor} aria-labelledby={id} lang={lang} className="tpl-section">
        <div className="tpl-narrow text-center">
          <h2 id={id} className="tpl-h2">
            {heading}
          </h2>
          {children}
        </div>
      </section>
    );
  }
  return (
    <section
      aria-labelledby={id}
      lang={lang}
      className="paper @container relative mt-8 border border-navy/45 p-[7px] text-navy"
    >
      {/* punched hole the cord passes through */}
      <span
        aria-hidden
        className="absolute top-[7px] left-1/2 size-[9px] -translate-x-1/2 rounded-full bg-paper-deep shadow-[inset_0_1px_2px_rgba(74,52,38,.35)]"
      />
      <div className="border border-navy/35 px-[clamp(1rem,6cqi,1.75rem)] pt-9 pb-8 text-center">
        <h2 id={id} className="card-heading">
          {heading}
        </h2>
        <Flourish className="mx-auto mt-2 text-navy/80" />
        {children}
      </div>
    </section>
  );
}
