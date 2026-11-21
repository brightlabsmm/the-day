"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { findSeat, type SeatMatch } from "@/app/w/[slug]/seat-action";

/** Search box: a guest types their name and sees their table. */
export function FindSeat({ slug, locale }: { slug: string; locale: Locale }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SeatMatch[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    start(async () => {
      const res = await findSeat(slug, query);
      setFailed(!res.ok);
      setMatches(res.ok ? res.matches : null);
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={submit} className="flex gap-2" role="search">
        <label className="sr-only" htmlFor="seat-q">
          {s("seatHint", locale)}
        </label>
        <input
          id="seat-q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={60}
          placeholder={s("seatHint", locale)}
          className="min-w-0 flex-1 rounded-full border border-[color:var(--navy)]/30 bg-white/80 px-5 py-3 text-[color:#222] outline-none focus:border-[color:var(--gold)]"
        />
        <button type="submit" disabled={pending} className="tpl-pill !px-5" aria-label={s("seatSearch", locale)}>
          <Search aria-hidden className="size-4" />
          <span className="sr-only">{s("seatSearch", locale)}</span>
        </button>
      </form>
      <div aria-live="polite" className="mt-6 min-h-6 text-center">
        {failed && <p className="text-[color:var(--ink-soft)]">{s("seatError", locale)}</p>}
        {matches && matches.length === 0 && !failed && <p className="text-[color:var(--ink-soft)]">{s("seatNone", locale)}</p>}
        {matches && matches.length > 0 && (
          <ul className="space-y-3">
            {matches.map((m, i) => (
              <li key={i} className="tpl-card !p-4">
                <p className="tpl-display text-[1.15rem] text-[color:var(--navy)]">{locale === "my" && m.nameMy ? m.nameMy : m.name}</p>
                <p className="tpl-eyebrow mt-1 !text-[color:var(--gold-deep)]">
                  {s("seatTable", locale)} {m.table}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
