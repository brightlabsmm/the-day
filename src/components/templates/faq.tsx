"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

/** Questions that open one at a time. */
export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <ul className="divide-y divide-[color:var(--navy)]/15 border-y border-[color:var(--navy)]/15 text-left">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="tpl-display text-[1.1rem] leading-snug text-[color:var(--navy)] [&:lang(my)]:text-[0.95rem]">{item.q}</span>
                <Plus aria-hidden className={`size-5 shrink-0 text-[color:var(--gold)] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h3>
            <div
              id={`${base}-${i}`}
              role="region"
              className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 leading-[1.9] whitespace-pre-line text-[color:var(--ink-soft)]">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
