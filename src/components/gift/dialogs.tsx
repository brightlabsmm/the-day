"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Play, X } from "lucide-react";
import type { GiftCampaign, GiftItem } from "@/lib/gift";
import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber, t } from "@/lib/i18n/numerals";
import { gs } from "@/lib/i18n/gift-strings";
import type { SignupState } from "@/app/g/[slug]/actions";
import { GiftIconView } from "./icons";

/**
 * A native <dialog>: focus moves into it, Escape closes it and the rest of
 * the page is inert while it is open. Clicking the dimmed backdrop closes it too.
 */
function Modal({ open, onClose, labelledBy, wide, children }: { open: boolean; onClose: () => void; labelledBy: string; wide?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`gift-dialog ${wide ? "max-w-lg" : "max-w-md"}`}
    >
      <div className="gift-dialog-panel relative">{children}</div>
    </dialog>
  );
}

function CloseButton({ onClose, locale }: { onClose: () => void; locale: Locale }) {
  return (
    <button type="button" onClick={onClose} aria-label={gs("close", locale)} className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-[#f3dca0]/70 transition hover:bg-white/5 hover:text-[#f8e2a2]">
      <X aria-hidden className="size-4" />
    </button>
  );
}

/** One gift: what it is, any extra (a tone, an excerpt, an oracle message) and its code. */
export function GiftDialog({
  item,
  campaign,
  locale,
  onClose,
  onCopy,
  onChime,
}: {
  item: GiftItem | null;
  campaign: GiftCampaign["campaign"];
  locale: Locale;
  onClose: () => void;
  onCopy: (code: string) => Promise<boolean>;
  onChime: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [shown, setShown] = useState<GiftItem | null>(item);

  // Keep the last gift on screen while the dialog closes, and reset its little states for a new one.
  if (item && item !== shown) {
    setShown(item);
    setCopied(false);
    setPlaying(false);
    setFlipped(false);
  }
  const g = item ?? shown;

  return (
    <Modal open={!!item} onClose={onClose} labelledBy="gift-title">
      {g && (
        <div className="px-6 py-7 text-center sm:px-8">
          <CloseButton onClose={onClose} locale={locale} />
          <p className="gift-caps inline-block rounded-full border border-[#e5c16c]/40 bg-[#e5c16c]/10 px-3 py-1 text-[0.6rem] text-[#f8e2a2]">
            {gs("blessing", locale)} {formatNumber(g.position, locale)}
            {t(g.category, locale) && ` · ${t(g.category, locale)}`}
          </p>
          <div className="gift-medallion mx-auto mt-4 grid size-16 place-items-center rounded-full">
            <GiftIconView icon={g.icon} className="size-7" />
          </div>
          <h2 id="gift-title" className="gift-display mt-4 text-[1.45rem] leading-snug [&:lang(my)]:text-[1.1rem] text-[#f8e2a2]">
            {t(g.title, locale)}
          </h2>
          {t(g.description, locale) && <p className="gift-serif mt-3 text-[1.1rem] leading-relaxed [&:lang(my)]:text-[0.9rem] text-[#f7f2e8]/90">{t(g.description, locale)}</p>}

          {g.kind === "audio" && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#e5c16c]/30 bg-[#e5c16c]/[0.07] p-3 text-left">
              <div className="min-w-0">
                <p className="truncate text-[0.8rem] font-semibold text-[#f8e2a2]">{t(g.detail_title, locale)}</p>
                {t(g.detail_text, locale) && <p className="text-[0.72rem] text-[#f7f2e8]/65">{t(g.detail_text, locale)}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  onChime();
                  setPlaying(true);
                  window.setTimeout(() => setPlaying(false), 1600);
                }}
                className="gift-chip shrink-0"
              >
                <Play aria-hidden className="size-3" /> {playing ? gs("playing", locale) : gs("playTone", locale)}
              </button>
            </div>
          )}

          {g.kind === "book" && t(g.detail_text, locale) && (
            <figure className="mt-5 rounded-xl border border-[#e5c16c]/25 bg-white/[0.03] p-4 text-left">
              <blockquote className="gift-serif text-[1.02rem] text-[#f7f2e8]/90 italic [&:lang(my)]:text-[0.88rem]">“{t(g.detail_text, locale)}”</blockquote>
              {t(g.detail_title, locale) && <figcaption className="mt-2 text-[0.72rem] text-[#e5c16c]">— {t(g.detail_title, locale)}</figcaption>}
            </figure>
          )}

          {g.kind === "oracle" && (
            <button
              type="button"
              onClick={() => {
                if (!flipped) onChime();
                setFlipped(true);
              }}
              aria-live="polite"
              className="gift-oracle mt-5 w-full rounded-xl px-4 py-3.5 text-[0.82rem] text-[#f8e2a2]"
            >
              {flipped ? (
                <span className="gift-serif text-[1.05rem] italic [&:lang(my)]:text-[0.9rem]">{t(g.detail_text, locale)}</span>
              ) : (
                <span className="gift-caps text-[0.66rem]">{t(g.detail_title, locale) || gs("flipCard", locale)}</span>
              )}
            </button>
          )}

          {g.code && (
            <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#e5c16c]/60 bg-[#03080d]/80 p-3.5">
              <div className="text-left">
                <span className="block text-[0.6rem] tracking-[0.14em] text-[#f3dca0]/60 uppercase">{gs("code", locale)}</span>
                <span className="font-mono text-[1rem] font-bold tracking-wider text-[#f8e2a2]">{g.code}</span>
              </div>
              <button
                type="button"
                onClick={async () => setCopied(await onCopy(g.code!))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#e5c16c] px-3.5 py-1.5 text-[0.75rem] font-semibold text-[#07121c] transition hover:brightness-110"
              >
                {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
                {copied ? gs("copied", locale) : gs("copy", locale)}
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            {campaign.shop_url && (
              <a
                href={campaign.shop_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (g.code) void onCopy(g.code);
                }}
                className="gift-gold-btn flex-1 rounded-xl px-4 py-2.5 text-[0.82rem]"
              >
                {gs("redeem", locale)}
              </a>
            )}
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#e5c16c]/40 px-4 py-2.5 text-[0.82rem] text-[#f7f2e8] transition hover:bg-white/5">
              {gs("keepBlooming", locale)}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Everything this visitor has unlocked, with each code one tap away. */
export function VaultDialog({
  open,
  items,
  unlocked,
  locale,
  onClose,
  onCopy,
  onReset,
}: {
  open: boolean;
  items: GiftItem[];
  unlocked: ReadonlySet<number>;
  locale: Locale;
  onClose: () => void;
  onCopy: (code: string) => Promise<boolean>;
  onReset: () => void;
}) {
  const mine = items.filter((i) => unlocked.has(i.position));
  return (
    <Modal open={open} onClose={onClose} labelledBy="vault-title" wide>
      <div className="flex max-h-[85svh] flex-col p-6">
        <CloseButton onClose={onClose} locale={locale} />
        <div className="border-b border-[#e5c16c]/25 pb-3 pr-10">
          <h2 id="vault-title" className="gift-display text-[1.25rem] text-[#f8e2a2] [&:lang(my)]:text-[1.05rem]">
            {gs("vaultTitle", locale)}
          </h2>
          <p className="text-[0.75rem] text-[#f7f2e8]/65">{gs("vaultIntro", locale)}</p>
        </div>
        <div className="-mx-1 flex-1 overflow-y-auto px-1 py-4">
          {mine.length === 0 ? (
            <p className="gift-serif py-8 text-center text-[1.1rem] [&:lang(my)]:text-[0.9rem] text-[#f7f2e8]/60 italic">{gs("vaultEmpty", locale)}</p>
          ) : (
            <ul className="space-y-3">
              {mine.map((g) => (
                <li key={g.position} className="flex items-center justify-between gap-3 rounded-xl border border-[#e5c16c]/30 bg-[#03080d]/70 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="gift-medallion grid size-10 shrink-0 place-items-center rounded-full">
                      <GiftIconView icon={g.icon} className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.68rem] text-[#e5c16c]">
                        #{formatNumber(g.position, locale)} · {t(g.category, locale)}
                      </p>
                      <p className="truncate text-[0.88rem] font-semibold text-[#f7f2e8]">{t(g.title, locale)}</p>
                    </div>
                  </div>
                  {g.code && (
                    <button type="button" onClick={() => onCopy(g.code!)} aria-label={`${gs("copy", locale)} ${g.code}`} className="shrink-0 rounded border border-[#e5c16c]/40 bg-[#e5c16c]/10 px-2.5 py-1 font-mono text-[0.72rem] text-[#f8e2a2] transition hover:bg-[#e5c16c]/25">
                      {g.code}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#e5c16c]/25 pt-3">
          <button type="button" onClick={onReset} disabled={mine.length === 0} className="text-[0.75rem] text-[#e6a8b8]/85 underline disabled:opacity-40">
            {gs("startOver", locale)}
          </button>
          <button type="button" onClick={onClose} className="gift-gold-btn rounded-full px-5 py-2 text-[0.75rem]">
            {gs("back", locale)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const ERRORS: Record<NonNullable<SignupState["error"]>, Parameters<typeof gs>[0]> = {
  name: "errName",
  contact: "errContact",
  closed: "errClosed",
  busy: "errBusy",
  generic: "errGeneric",
};

/** The wax-sealed sign-up form. On success it turns into a VIP pass. */
export function InviteDialog({
  open,
  campaign,
  locale,
  action,
  onClose,
  onDone,
}: {
  open: boolean;
  campaign: GiftCampaign["campaign"];
  locale: Locale;
  action: (prev: SignupState, form: FormData) => Promise<SignupState>;
  onClose: () => void;
  onDone: (name: string) => void;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as SignupState);
  const intentions = campaign.invite_intentions.map((i) => t(i, locale)).filter(Boolean);
  const reported = useRef<SignupState | null>(null);

  useEffect(() => {
    if (state.status === "ok" && reported.current !== state) {
      reported.current = state;
      onDone(state.name ?? "");
    }
  }, [state, onDone]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="invite-title">
      <div className="gift-invite px-6 py-8 text-center sm:px-8">
        <CloseButton onClose={onClose} locale={locale} />
        <div className="gift-seal mx-auto grid size-16 place-items-center rounded-full">
          <GiftIconView icon="lotus" className="size-7" />
        </div>
        <p className="gift-caps mt-4 text-[0.62rem] text-[#e5c16c]">{gs("inviteEyebrow", locale)}</p>
        <h2 id="invite-title" className="gift-serif mt-1 text-[1.9rem] leading-tight [&:lang(my)]:text-[1.3rem] text-[#f8e2a2] italic">
          {t(campaign.invite_title, locale) || gs("inviteTitleFallback", locale)}
        </h2>
        {t(campaign.invite_text, locale) && <p className="mt-3 text-[0.82rem] leading-relaxed text-[#f7f2e8]/80">{t(campaign.invite_text, locale)}</p>}

        {state.status === "ok" ? (
          <div role="status" className="mt-6 rounded-xl border border-[#e5c16c] bg-[#03080d]/90 p-5">
            <p className="gift-caps text-[0.6rem] text-[#e5c16c]">✦ {gs("vipForged", locale)} ✦</p>
            <p className="gift-display mt-2 text-[1.3rem] text-[#f8e2a2] [&:lang(my)]:text-[1.1rem]">{gs("welcome", locale, { name: state.name ?? "" })}</p>
            {state.intention && <p className="mt-1 text-[0.75rem] text-[#f7f2e8]/70">{state.intention}</p>}
            {state.vipCode && (
              <p className="mt-4 rounded-lg border border-dashed border-[#e5c16c] bg-[#e5c16c]/10 px-3 py-2 font-mono text-[0.9rem] font-bold text-[#f8e2a2]">
                {gs("vipKey", locale)}: {state.vipCode}
              </p>
            )}
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-3.5 text-left">
            {/* Honeypot: hidden from people, filled in by bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-[0.72rem] text-[#f8e2a2]">{gs("yourName", locale)}</span>
              <input name="name" required maxLength={80} autoComplete="name" className="gift-input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[0.72rem] text-[#f8e2a2]">{gs("contact", locale)}</span>
              <input name="contact" required minLength={3} maxLength={120} autoComplete="email" className="gift-input" />
            </label>
            {intentions.length > 0 && (
              <label className="block">
                <span className="mb-1 block text-[0.72rem] text-[#f8e2a2]">{gs("intention", locale)}</span>
                <select name="intention" className="gift-input" defaultValue={intentions[0]}>
                  {intentions.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {state.status === "error" && state.error && (
              <p role="alert" className="text-[0.78rem] text-[#f0a3b4]">
                {gs(ERRORS[state.error], locale)}
              </p>
            )}
            <button type="submit" disabled={pending} className="gift-gold-btn gift-caps mt-2 w-full rounded-xl py-3 text-[0.72rem] disabled:opacity-70 [&:lang(my)]:text-[0.95rem]">
              {pending ? gs("sending", locale) : gs("submitInvite", locale)}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
