import Link from "next/link";

const TABS = [
  { href: "", label: "Guests" },
  { href: "/details", label: "Details" },
  { href: "/events", label: "Events" },
  { href: "/wishes", label: "Wishes" },
];

export function AdminNav({ slug, current }: { slug: string; current: "" | "/details" | "/events" | "/wishes" }) {
  return (
    <header>
      <Link href="/admin" className="label-caps text-ink-soft underline">
        ← Weddings
      </Link>
      <h1 className="font-display mt-2 text-3xl font-semibold">/{slug}</h1>
      <nav className="mt-4 flex gap-4 border-b border-navy/30" aria-label="Wedding sections">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={`/admin/${slug}${t.href}`}
            aria-current={t.href === current ? "page" : undefined}
            className={`label-caps -mb-px border-b-2 px-1 py-2 ${t.href === current ? "border-gold text-navy" : "border-transparent text-ink-soft"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="mt-2">
        <Link href={`/w/${slug}`} target="_blank" className="text-sm text-ink-soft underline">
          Preview invitation ↗
        </Link>
      </p>
    </header>
  );
}

export const inputClass = "block w-full border border-navy/40 bg-white/70 px-3 py-2 outline-none focus:border-gold";

/** A pair of inputs for a translatable {my, en} field. */
export function I18nField({
  name,
  label,
  value,
  multiline,
}: {
  name: string;
  label: string;
  value: unknown;
  multiline?: boolean;
}) {
  const v = (value ?? {}) as { my?: string; en?: string };
  const Tag = multiline ? "textarea" : "input";
  return (
    <fieldset className="space-y-1">
      <legend className="label-caps">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <Tag name={`${name}_my`} lang="my" defaultValue={v.my ?? ""} placeholder="မြန်မာ" className={inputClass} {...(multiline ? { rows: 4 } : {})} />
        <Tag name={`${name}_en`} lang="en" defaultValue={v.en ?? ""} placeholder="English" className={inputClass} {...(multiline ? { rows: 4 } : {})} />
      </div>
    </fieldset>
  );
}
