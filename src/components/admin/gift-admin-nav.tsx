import Link from "next/link";

const TABS = [
  { href: "", label: "Campaign & gifts" },
  { href: "/signups", label: "Sign-ups" },
] as const;

export function GiftAdminNav({ slug, current }: { slug: string; current: (typeof TABS)[number]["href"] }) {
  return (
    <header>
      <Link href="/admin" className="label-caps text-ink-soft underline">
        ← All invitations
      </Link>
      <h1 className="font-display mt-2 text-3xl font-semibold">
        Gift invitation <span className="text-ink-soft">/g/{slug}</span>
      </h1>
      <nav className="mt-4 flex gap-4 border-b border-navy/30" aria-label="Gift campaign sections">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={`/admin/gifts/${slug}${t.href}`}
            aria-current={t.href === current ? "page" : undefined}
            className={`label-caps -mb-px border-b-2 px-1 py-2 ${t.href === current ? "border-gold text-navy" : "border-transparent text-ink-soft"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="mt-2">
        <Link href={`/g/${slug}`} target="_blank" className="text-sm text-ink-soft underline">
          Preview gift page ↗
        </Link>
      </p>
    </header>
  );
}
