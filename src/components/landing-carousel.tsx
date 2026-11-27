"use client";

/* eslint-disable @next/next/no-img-element -- small pre-cropped static pictures */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type TemplateCard = {
  name: string;
  img: string;
  event: string;
  /**
   * Wording printed on a blank card in the picture (2:3 pictures only): `inset` places the text box
   * over the card as CSS inset percentages, `content` is the text. Sizes inside use cqw (1% of the picture's width).
   */
  card?: { inset: string; content: ReactNode };
  /** Live demo of the design (real designs only); the preview offers it as "View live demo". */
  demo?: string;
};

/**
 * One row of template cards that slides sideways: three at a time on desktop, two on tablets and
 * one and a bit on phones. Arrows move a page, dots show where you are, and it also scrolls by
 * swipe or trackpad (scroll snap keeps cards aligned). Blank invitation cards in the pictures can
 * carry their own wording. Tapping a card opens a larger preview (no demo pages) with a button to
 * ask about that design on Messenger.
 */
export function TemplateCarousel({ cards, contactUrl }: { cards: TemplateCard[]; contactUrl: string }) {
  const track = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  // Open or close the native dialog to match the chosen card (it handles focus, Esc and the backdrop layer).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const shown = open === null ? null : cards[open];
  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + cards.length) % cards.length));
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
          {cards.map((c, i) => (
            <li key={c.name} className="tcar-item">
              <button type="button" className="tcar-open" onClick={() => setOpen(i)} aria-label={`Preview ${c.name}`}>
                <Picture card={c} />
                <span className="tcar-zoom" aria-hidden>
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4M11 8.5v5M8.5 11h5" /></svg>
                </span>
              </button>
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
      <dialog
        ref={dialog}
        className="tprev"
        aria-label={shown ? `${shown.name} preview` : "Template preview"}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null); // click on the dimmed backdrop
        }}
      >
        {shown && (
          <div className="tprev-body">
            <div className="tprev-pic">
              <Picture card={shown} full />
            </div>
            <div className="tprev-info">
              <p className="tprev-event">{shown.event}</p>
              <h3 className="font-display">{shown.name}</h3>
              <span className="tprev-rule" aria-hidden />
              <p className="tprev-copy">
                Names, dates, wording, colours and language are all set for your celebration, in English, Burmese or both.
              </p>
              <div className="tprev-actions">
                <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="gbtn">Ask about this design</a>
                {shown.demo && (
                  <a href={shown.demo} target="_blank" rel="noopener noreferrer" className="obtn">View live demo</a>
                )}
              </div>
              <div className="tprev-nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous template">
                  <svg viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <span>{(open ?? 0) + 1} / {cards.length}</span>
                <button type="button" onClick={() => step(1)} aria-label="Next template">
                  <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            <button type="button" className="tprev-close" onClick={() => setOpen(null)} aria-label="Close preview">
              <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        )}
      </dialog>
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

/** A card's picture: with its printed wording when it has some; screenshots are never cropped. */
function Picture({ card, full = false }: { card: TemplateCard; full?: boolean }) {
  const img = <img src={`/landing/${card.img}.webp`} alt={`${card.name} invitation design`} loading="lazy" />;
  // Design screenshots are tall phone pages: shown whole on a 2:3 panel in the row, or on their own in the preview.
  if (!card.card) return <div className={full ? "tprev-shot" : "tcar-shot"}>{img}</div>;
  return (
    <div className="tcar-pic">
      {img}
      <div className="tcar-text" style={{ inset: card.card.inset }}>{card.card.content}</div>
    </div>
  );
}
