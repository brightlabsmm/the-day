"use client";

import { useActionState, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/w/[slug]/actions";
import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber } from "@/lib/i18n/numerals";
import { s, type StringKey } from "@/lib/i18n/strings";

const ERRORS: Record<NonNullable<RsvpState["error"]>, StringKey> = {
  name: "wishErrorName",
  input: "rsvpErrorInput",
  closed: "wishErrorClosed",
  busy: "wishErrorBusy",
  generic: "wishErrorGeneric",
};

/** RSVP: accept or decline, how many are coming, an optional note. */
export function RsvpForm({ slug, token, locale, defaultName }: { slug: string; token: string | null; locale: Locale; defaultName: string }) {
  const [state, action, pending] = useActionState(submitRsvp.bind(null, slug, token ?? ""), { status: "idle" } as RsvpState);
  const [attending, setAttending] = useState(true);

  if (state.status === "ok") {
    return (
      <p role="status" className={`tpl-display mt-8 text-center text-[color:var(--navy)] ${locale === "my" ? "text-[1.05rem]" : "text-[1.3rem]"}`}>
        {state.updated ? s("rsvpUpdated", locale) : s(state.attending ? "rsvpThanksYes" : "rsvpThanksNo", locale)}
      </p>
    );
  }

  const field =
    "block w-full border border-[color:var(--navy)]/40 bg-[color:var(--ivory)]/70 px-3 py-2 text-left text-[color:var(--ink)] outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]";
  const choice = (on: boolean) =>
    `flex-1 cursor-pointer border px-4 py-3 text-center text-[0.95rem] transition ${on ? "border-[color:var(--navy)] bg-[color:var(--navy)] text-[color:var(--ivory)]" : "border-[color:var(--navy)]/40 hover:border-[color:var(--navy)]"}`;

  return (
    <form action={action} className="mx-auto mt-8 max-w-md space-y-4 text-left">
      <div>
        <label htmlFor="rsvp-name" className="tpl-eyebrow !text-left">
          {s("rsvpName", locale)}
        </label>
        <input id="rsvp-name" name="name" required maxLength={80} defaultValue={defaultName} autoComplete="name" className={field} />
      </div>

      <fieldset>
        <legend className="sr-only">{s("rsvpHeading", locale)}</legend>
        <div className="flex gap-3">
          {[true, false].map((yes) => (
            <label key={String(yes)} className={choice(attending === yes)}>
              <input type="radio" name="attending" value={yes ? "yes" : "no"} checked={attending === yes} onChange={() => setAttending(yes)} className="sr-only" />
              {s(yes ? "rsvpAccept" : "rsvpDecline", locale)}
            </label>
          ))}
        </div>
      </fieldset>

      {attending && (
        <div>
          <label htmlFor="rsvp-party" className="tpl-eyebrow !text-left">
            {s("rsvpParty", locale)}
          </label>
          <select id="rsvp-party" name="party" defaultValue="1" className={field}>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {formatNumber(n, locale)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="rsvp-note" className="tpl-eyebrow !text-left">
          {s("rsvpNote", locale)}
        </label>
        <textarea id="rsvp-note" name="note" rows={3} maxLength={300} className={field} />
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <p role="status" aria-live="polite" className="min-h-[1.5em] text-center text-[0.95rem] text-[color:var(--navy)]">
        {state.status === "error" && s(ERRORS[state.error ?? "generic"], locale)}
      </p>
      <button type="submit" disabled={pending} className="tpl-btn mx-auto block disabled:opacity-60">
        {pending ? s("wishSending", locale) : s("rsvpSend", locale)}
      </button>
    </form>
  );
}
