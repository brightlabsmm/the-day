"use client";

/*
 * Two small links, "မြန်မာ · EN", fixed to the top-left corner. They are plain
 * links (the page re-renders on the server in the chosen language), so they
 * work before JavaScript loads; with JavaScript the switch keeps the scroll
 * position and remembers the choice in a cookie.
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/numerals";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

const OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: "my", label: "မြန်မာ", name: "မြန်မာဘာသာ" },
  { locale: "en", label: "EN", name: "English" },
];

/** Remembers the guest's choice for a year, for when they reopen their link. */
function rememberLocale(next: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (next: Locale) => {
    const q = new URLSearchParams(params.toString());
    q.set("lang", next);
    return `${pathname}?${q.toString()}`;
  };

  return (
    <nav
      aria-label="ဘာသာစကား / Language"
      className="lang-switch fixed top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-[60]"
    >
      {OPTIONS.map((o, i) => (
        <span key={o.locale} className="flex items-center">
          {i > 0 && <span aria-hidden className="lang-sep" />}
          <Link
            href={hrefFor(o.locale)}
            replace
            scroll={false}
            prefetch={false}
            onClick={() => rememberLocale(o.locale)}
            lang={o.locale}
            aria-label={o.name}
            aria-current={o.locale === locale ? "true" : undefined}
            className="lang-option"
          >
            {o.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
