import Image from "next/image";
import type { Locale } from "@/lib/i18n/numerals";
import { FACEBOOK_URL } from "@/components/site-chrome";

/**
 * "Made with The Day" at the very end of an invitation: our profile picture and name on one
 * small line. Tapping it opens our Facebook page. It takes its colours from the page design.
 */
export function TheDayPromo({ locale }: { locale: Locale }) {
  return (
    <aside lang={locale} aria-label="The Day" className="mx-auto mt-8 flex justify-center border-t border-current/15 pt-5">
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--paper)]/85 py-1.5 pr-4 pl-1.5 text-[color:var(--navy)] shadow-[0_8px_20px_-14px_rgba(79,62,49,.6)] backdrop-blur-sm"
      >
        <Image src="/brand/the-day-profile.webp" alt="" width={36} height={36} className="size-9 rounded-full shadow-[0_6px_14px_-8px_rgba(79,62,49,.7)]" />
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-[1.5rem] leading-none" style={{ fontFamily: 'var(--font-script), "Great Vibes", cursive' }}>
            The Day
          </span>
          <span lang="en" className="text-[0.66rem] font-medium tracking-[0.12em] text-[color:var(--navy)] uppercase">
            - E-Invitation Service
          </span>
        </span>
      </a>
    </aside>
  );
}
