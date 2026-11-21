"use client";

import { useActionState } from "react";
import { submitWish, type WishState } from "@/app/w/[slug]/actions";
import type { Locale } from "@/lib/i18n/numerals";
import { s, type StringKey } from "@/lib/i18n/strings";

const ERRORS: Record<NonNullable<WishState["error"]>, StringKey> = {
  name: "wishErrorName",
  message: "wishErrorMessage",
  closed: "wishErrorClosed",
  sent: "wishErrorSent",
  generic: "wishErrorGeneric",
};

export function WishForm({
  slug,
  token,
  locale,
  defaultName,
  existing,
  canEdit,
}: {
  slug: string;
  token: string;
  locale: Locale;
  defaultName: string;
  existing: string | null;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState(submitWish.bind(null, slug, token), { status: "idle" } as WishState);
  const locked = existing !== null && !canEdit;
  if (locked) return null;

  const field =
    "block w-full border border-navy/40 bg-ivory/60 px-3 py-2 text-left text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold";

  return (
    <form action={action} className="mt-6 space-y-3 text-left">
      <p className="card-body text-center">{s("wishesIntro", locale)}</p>
      <div>
        <label htmlFor="wish-name" className="label-caps text-ink-soft">
          {s("wishName", locale)}
        </label>
        <input id="wish-name" name="name" required maxLength={80} defaultValue={defaultName} autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="wish-message" className="label-caps text-ink-soft">
          {s("wishMessage", locale)}
        </label>
        <textarea id="wish-message" name="message" required maxLength={500} rows={4} defaultValue={existing ?? ""} className={field} />
      </div>
      <p role="status" aria-live="polite" className="card-body min-h-[1.5em] text-center">
        {state.status === "ok" && s("wishThanks", locale)}
        {state.status === "updated" && s("wishUpdated", locale)}
        {state.status === "error" && s(ERRORS[state.error ?? "generic"], locale)}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="label-caps mx-auto block border border-navy bg-navy px-6 py-2.5 text-ivory disabled:opacity-60"
      >
        {pending ? s("wishSending", locale) : existing !== null || state.status === "ok" ? s("wishUpdate", locale) : s("wishSend", locale)}
      </button>
    </form>
  );
}
