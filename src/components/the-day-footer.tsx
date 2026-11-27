import Link from "next/link";
import { CurrentYear } from "@/components/current-year";
import { FACEBOOK_URL } from "@/components/site-chrome";

const script = { fontFamily: 'var(--font-script), "Great Vibes", cursive' };
const caps = { fontFamily: 'var(--font-jost), "Jost", system-ui, sans-serif' };
const serif = { fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' };

const dot = (
  <span className="px-1.5 text-[#b8913f] sm:px-2" aria-hidden>
    &middot;
  </span>
);

/**
 * The landing page's footer, set at the end of every invitation whatever its design. On wide screens
 * the brand and links sit on the left and the copyright on the right; on phones it shrinks to two
 * short lines (the brand, then the links and copyright) so it does not crowd the invitation's ending.
 * It keeps the brand's own cream and gold so it reads the same under every template.
 */
export function TheDayFooter() {
  return (
    <footer lang="en" className="relative z-10 border-t border-[#c9a96a]/35 text-[#5c524b]" style={{ background: "#f3e8dc" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:justify-between sm:gap-3 sm:px-6 sm:py-6 sm:text-left">
        <div className="flex flex-col items-center gap-x-5 gap-y-0.5 sm:flex-row">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-[1.35rem] leading-none text-[#3b3632] sm:text-[1.9rem]" style={script}>
              The Day
            </span>
            <span className="text-[0.56rem] tracking-[0.2em] text-[#6b625c] uppercase sm:text-[0.68rem]" style={caps}>
              Digital Invitations
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-[#c9a96a]/50 sm:block" aria-hidden />
          <nav className="text-[0.82rem] sm:text-[1.02rem]" style={serif} aria-label="The Day">
            <Link href="/#templates" className="inline-block py-1 hover:text-[#2f2925] sm:py-2.5">
              Templates
            </Link>
            {dot}
            <Link href="/pricing" className="inline-block py-1 hover:text-[#2f2925] sm:py-2.5">
              Pricing
            </Link>
            {dot}
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-[#2f2925] sm:py-2.5">
              Messenger
            </a>
            <span className="sm:hidden">
              {dot}
              <span className="text-[#6b625c]">
                &copy; <CurrentYear /> The Day
              </span>
            </span>
          </nav>
        </div>
        <p className="hidden text-sm text-[#6b625c] sm:block" style={serif}>
          &copy; <CurrentYear /> The Day. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
