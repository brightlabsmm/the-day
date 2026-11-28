"use client";

import { createContext, startTransition, use, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, LoaderCircle } from "lucide-react";
import type { Action } from "@/lib/admin/schemas";
import { buttonClass } from "./ui";

const Pending = createContext(false);

/**
 * A form that runs an admin action and shows its answer ("Saved", or what went wrong) beside the
 * button. What was typed stays in place when the action fails, so nothing is lost.
 *
 * - `submitLabel` adds the standard footer: a dark button with the answer next to it.
 * - Without it, place a `<SubmitButton>` inside; errors then show after the form's content.
 * - `confirm` asks first (for deletes).
 * - `resetOnSuccess` clears the fields after it works (for "add" forms).
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  confirm,
  resetOnSuccess,
  className = "",
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  confirm?: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
        startTransition(() => run(data));
      }}
    >
      <Pending value={pending}>
        {children}
        {submitLabel ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#efe6d8] pt-4">
            <SubmitButton>{submitLabel}</SubmitButton>
            {state && <Answer key={state.at} ok={state.ok} message={state.message} />}
          </div>
        ) : (
          state && <Answer key={state.at} ok={state.ok} message={state.message} />
        )}
      </Pending>
    </form>
  );
}

function Answer({ ok, message }: { ok: boolean; message: string }) {
  return ok ? (
    <span role="status" className="admin-fade inline-flex items-center gap-1 text-sm font-medium text-[#2f6b35]">
      <Check className="size-4" aria-hidden /> {message}
    </span>
  ) : (
    <span role="alert" className="text-sm text-[#a3392f]">
      {message}
    </span>
  );
}

/** The form's button; it shows a spinner and stays disabled while the action runs. */
export function SubmitButton({ children, variant = "primary", className = "", ...rest }: { children: ReactNode; variant?: keyof typeof buttonClass; className?: string; name?: string; value?: string; disabled?: boolean; "aria-label"?: string; title?: string }) {
  const pending = use(Pending);
  return (
    <button type="submit" {...rest} disabled={pending || rest.disabled} className={`${buttonClass[variant]} ${className}`}>
      {pending && variant === "primary" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={buttonClass.secondary}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
    >
      {done ? <Check className="size-3.5 text-[#2f6b35]" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}
