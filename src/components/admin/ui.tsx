import type { ComponentProps, ReactNode } from "react";

/*
 * The admin's building blocks: cards, fields and badges in one place, so every page looks the same
 * and a style changes in one spot. Server-safe (no hooks); the interactive pieces live in
 * action-form.tsx.
 */

export const inputClass =
  "block w-full rounded-lg border border-[#ddd1bf] bg-[#fdfbf8] px-3 py-2 text-[0.95rem] text-[#2f2925] outline-none transition placeholder:text-[#a89c90] focus:border-[#b8913f] focus:ring-2 focus:ring-[#b8913f]/20 disabled:opacity-60";
export const monoInputClass = `${inputClass} font-mono text-[0.85rem]`;

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#2f2925] px-4 py-2 text-sm font-medium text-[#fbf6ee] transition hover:bg-[#463d37] disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[#ddd1bf] bg-white px-3 py-1.5 text-sm font-medium text-[#2f2925] transition hover:border-[#b8913f] hover:bg-[#fbf6ee] disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#5c524b] transition hover:bg-[#f3ebdf] hover:text-[#2f2925] disabled:opacity-40 disabled:hover:bg-transparent",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#a3392f] transition hover:bg-[#f9e6e3] disabled:opacity-40",
} as const;

export function PageTitle({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[2rem] leading-tight font-semibold text-[#2f2925]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#7a6f66]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#e7dccb] bg-white shadow-[0_1px_2px_rgba(60,40,20,0.05)] ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#efe6d8] px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[#2f2925]">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-[#7a6f66]">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

/** A labelled control with an optional hint underneath. */
export function Field({ label, hint, children, className = "" }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.8rem] font-medium text-[#5c524b]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#8a7f75]">{hint}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}
export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={3} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}
export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

/** One field typed in both languages, Burmese and English side by side. Saved as `<name>_my` / `<name>_en`. */
export function BilingualField({
  name,
  label,
  value,
  multiline,
  rows = 3,
  hint,
  mono,
}: {
  name: string;
  label: ReactNode;
  value: unknown;
  multiline?: boolean;
  rows?: number;
  hint?: ReactNode;
  mono?: boolean;
}) {
  const v = (value && typeof value === "object" ? value : {}) as { my?: string; en?: string };
  const cls = `${mono ? monoInputClass : inputClass} ${multiline ? "resize-y" : ""}`;
  const langs = [
    { lang: "en", tag: "EN", placeholder: "English" },
    { lang: "my", tag: "မြန်မာ", placeholder: "မြန်မာ" },
  ] as const;
  return (
    <fieldset>
      <legend className="mb-1.5 text-[0.8rem] font-medium text-[#5c524b]">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {langs.map(({ lang, tag, placeholder }) => (
          <div key={lang} className="relative">
            {multiline ? (
              <textarea name={`${name}_${lang}`} lang={lang} rows={rows} defaultValue={v[lang] ?? ""} placeholder={placeholder} aria-label={`${typeof label === "string" ? label : name} (${placeholder})`} className={`${cls} pr-14`} />
            ) : (
              <input name={`${name}_${lang}`} lang={lang} defaultValue={v[lang] ?? ""} placeholder={placeholder} aria-label={`${typeof label === "string" ? label : name} (${placeholder})`} className={`${cls} pr-14`} />
            )}
            <span className="pointer-events-none absolute top-2 right-2 rounded bg-[#f3ebdf] px-1.5 py-0.5 text-[0.62rem] font-medium tracking-wide text-[#8a7f75]" aria-hidden>
              {tag}
            </span>
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-[#8a7f75]">{hint}</p>}
    </fieldset>
  );
}

/** A switch-style checkbox with a title and a line of explanation. */
export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: ReactNode; hint?: ReactNode; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-[#2f2925]">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-[#8a7f75]">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#ddd1bf] transition peer-checked:bg-[#2f2925] peer-focus-visible:ring-2 peer-focus-visible:ring-[#b8913f]/50 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
    </label>
  );
}

const BADGE = {
  published: "bg-[#e6f1e4] text-[#2f6b35]",
  draft: "bg-[#f3ebdf] text-[#7a6f66]",
  yes: "bg-[#e6f1e4] text-[#2f6b35]",
  no: "bg-[#f9e6e3] text-[#a3392f]",
  neutral: "bg-[#f3ebdf] text-[#5c524b]",
  gold: "bg-[#f6ecd6] text-[#8a6a2a]",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status === "published" ? "published" : "draft"}>{status === "published" ? "Published" : "Draft"}</Badge>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-[#ddd1bf] px-4 py-8 text-center text-sm text-[#8a7f75]">{children}</p>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-[#ecd9ad] bg-[#fbf3e1] px-4 py-3 text-sm text-[#6b5320]">{children}</p>;
}

/** A row of figures, e.g. guests opened, replies. */
export function Stats({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-[#e7dccb] bg-white px-4 py-3">
          <dt className="text-xs text-[#8a7f75]">{s.label}</dt>
          <dd className="mt-0.5 text-2xl font-semibold text-[#2f2925] tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Loading() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading">
      {[0, 1].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl border border-[#e7dccb] bg-white/70" />
      ))}
    </div>
  );
}
