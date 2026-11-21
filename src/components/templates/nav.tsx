"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/numerals";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { s } from "@/lib/i18n/strings";

export type NavItem = { id: string; label: string };

const LANGS: { locale: Locale; label: string; name: string }[] = [
  { locale: "my", label: "မြန်မာ", name: "မြန်မာဘာသာ" },
  { locale: "en", label: "EN", name: "English" },
];

/** Remembers the guest's choice for a year, for when they reopen their link. */
function remember(next: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

/**
 * Top bar: monogram, section links and the language switch. `over="dark"`
 * means it floats over a dark photo (white text) until the page scrolls.
 */
export function TemplateNav({
  locale,
  monogram,
  items,
  over,
}: {
  locale: Locale;
  monogram: string;
  items: NavItem[];
  over: "dark" | "light";
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > (over === "dark" ? window.innerHeight * 0.7 : 24));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [over]);

  const hrefFor = (next: Locale) => {
    const q = new URLSearchParams(params.toString());
    q.set("lang", next);
    return `${pathname}?${q.toString()}`;
  };

  const links = items.map((i) => (
    <a key={i.id} href={`#${i.id}`} onClick={() => setOpen(false)} className="py-2 hover:opacity-60">
      {i.label}
    </a>
  ));

  return (
    <nav
      className="tpl-nav"
      data-solid={solid || open}
      data-over={over}
      aria-label={locale === "my" ? "စာမျက်နှာ လမ်းညွှန်" : "Page navigation"}
    >
      <a href="#top" className="tpl-display !text-base !tracking-[0.12em] normal-case" aria-label={monogram}>
        {monogram}
      </a>

      <div className="hidden items-center gap-7 md:flex">{links}</div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2" role="group" aria-label="ဘာသာစကား / Language">
          {LANGS.map((l, i) => (
            <span key={l.locale} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="opacity-40">/</span>}
              <Link
                href={hrefFor(l.locale)}
                replace
                scroll={false}
                prefetch={false}
                lang={l.locale}
                aria-label={l.name}
                aria-current={l.locale === locale ? "true" : undefined}
                onClick={() => remember(l.locale)}
                className={l.locale === locale ? "font-semibold" : "opacity-60 hover:opacity-100"}
              >
                {l.label}
              </Link>
            </span>
          ))}
        </div>
        <button
          type="button"
          className="grid size-9 place-items-center md:hidden"
          aria-expanded={open}
          aria-controls="tpl-menu"
          aria-label={open ? s("closeMenu", locale) : s("menu", locale)}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div
          id="tpl-menu"
          className="absolute inset-x-0 top-full flex flex-col items-center gap-1 bg-[color:var(--ivory)] px-6 py-5 text-[color:var(--navy)] shadow-md md:hidden"
        >
          {links}
        </div>
      )}
    </nav>
  );
}
