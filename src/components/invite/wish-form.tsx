"use client";

import { useActionState } from "react";
import { submitPublicWish, submitWish, type WishState } from "@/app/w/[slug]/actions";
import type { Locale } from "@/lib/i18n/numerals";
import { s, type StringKey } from "@/lib/i18n/strings";

const ERRORS: Record<NonNullable<WishState["error"]>, StringKey> = {
  name: "wishErrorName",
  message: "wishErrorMessage",
  closed: "wishErrorClosed",
  sent: "wishErrorSent",
  busy: "wishErrorBusy",
  generic: "wishErrorGeneric",
};

type Props = {
  slug: string;
  locale: Locale;
  defaultName: string;
  /** A line above the form in place of "Leave a blessing for the couple", e.g. for a birthday. */
  intro?: string;
} & (
  | { mode: "guest"; token: string; existing: string | null; canEdit: boolean }
  | { mode: "public" }
);

/**
 * Wish form. "guest" mode is for a personal link (one wish per guest, editable
 * if the couple allows). "public" mode is for an open invitation: anyone can
 * add a wish, once per submit.
 */
export function WishForm(props: Props) {
  const { slug, locale, defaultName } = props;
  const action =
    props.mode === "guest" ? submitWish.bind(null, slug, props.token) : submitPublicWish.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as WishState);

  const existing = props.mode === "guest" ? props.existing : null;
  if (props.mode === "guest" && existing !== null && !props.canEdit) return null;

  if (props.mode === "public" && state.status === "ok") {
    return (
      <p role="status" className="card-body mt-6 text-center">
        {s("wishThanks", locale)}
      </p>
    );
  }

  const field =
    "block w-full border border-navy/40 bg-ivory/60 px-3 py-2 text-left text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold";

  return (
    <form action={formAction} className="mt-6 space-y-3 text-left">
      <p className="card-body text-center">{props.intro ?? s("wishesIntro", locale)}</p>
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
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
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
        {pending
          ? s("wishSending", locale)
          : existing !== null || state.status === "ok"
            ? s("wishUpdate", locale)
            : s("wishSend", locale)}
      </button>
    </form>
  );
}
