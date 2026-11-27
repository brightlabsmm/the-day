"use client";

/* eslint-disable @next/next/no-img-element -- small pre-cropped static pictures */
import { useCallback, useEffect, useRef, useState } from "react";

export type TemplateCard = { name: string; img: string; event: string };

/**
 * One row of template cards that slides sideways: three at a time on desktop, two on tablets and
 * one and a bit on phones. Arrows move a page, dots show where you are, and it also scrolls by
 * swipe or trackpad (scroll snap keeps cards aligned). Cards are pictures only, with no links.
 */
export function TemplateCarousel({ cards }: { cards: TemplateCard[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  /**
   * Layout from the cards themselves: the distance between two cards (step), how many fit at once
   * (per) and how many pages that makes. The last page shows the final cards, so none is skipped.
   */
  const layout = useCallback(() => {
    const el = track.current;
    const kids = el ? (Array.from(el.children) as HTMLElement[]) : [];
    if (!el || kids.length === 0) return null;
    const base = kids[0].offsetLeft;
    const step = Math.max(1, (kids[1]?.offsetLeft ?? base + kids[0].offsetWidth) - base);
    const per = Math.max(1, Math.round(el.clientWidth / step));
    const total = Math.max(1, Math.ceil(Math.max(0, kids.length - per) / per) + 1);
    /** Card that starts page p. */
    const cardOf = (p: number) => Math.min(p * per, Math.max(0, kids.length - per));
    return { el, kids, base, step, per, total, cardOf };
  }, []);

  const measure = useCallback(() => {
    const l = layout();
    if (!l) return;
    setPages(l.total);
    const index = Math.round(l.el.scrollLeft / l.step);
    setPage(index >= l.cardOf(l.total - 1) ? l.total - 1 : Math.min(l.total - 1, Math.round(index / l.per)));
  }, [layout]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Fires once on observe (the first measurement) and again on every resize.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const go = (to: number) => {
    const l = layout();
    if (!l) return;
    const target = Math.max(0, Math.min(l.total - 1, to));
    setPage(target); // update the dots and arrows now, not only when the scroll event arrives
    l.el.scrollTo({ left: l.kids[l.cardOf(target)].offsetLeft - l.base, behavior: "smooth" });
  };

  return (
    <div className="tcar mx-auto mt-12 max-w-6xl">
      <div className="relative">
        <ul ref={track} onScroll={measure} className="tcar-track" aria-label="Invitation templates">
          {cards.map((c) => (
            <li key={c.name} className="tcar-item">
              <img src={`/landing/${c.img}.webp`} alt={`${c.name} invitation design`} loading="lazy" />
              <h3 className="font-display">{c.name}</h3>
              <p>{c.event}</p>
            </li>
          ))}
        </ul>
        <button type="button" className="tcar-arrow left-0" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous templates">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="tcar-arrow right-0" onClick={() => go(page + 1)} disabled={page >= pages - 1} aria-label="Next templates">
          <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {pages > 1 && (
        <div className="tcar-dots" role="tablist" aria-label="Template pages">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === page} aria-label={`Page ${i + 1}`} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
