import Link from "next/link";
import { CurrentYear } from "@/components/current-year";
import { FACEBOOK_URL } from "@/components/site-chrome";

const script = { fontFamily: 'var(--font-script), "Great Vibes", cursive' };
const caps = { fontFamily: 'var(--font-jost), "Jost", system-ui, sans-serif' };
const serif = { fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' };

/**
 * The landing page's footer, set at the end of every invitation whatever its design: the brand and
 * links on the left, the copyright on the right (stacked and centred on phones). It keeps the brand's
 * own cream and gold so it reads the same under every template.
 */
export function TheDayFooter() {
  return (
    <footer lang="en" className="relative z-10 border-t border-[#c9a96a]/35 text-[#5c524b]" style={{ background: "#f3e8dc" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-x-5 gap-y-1 sm:flex-row">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="text-[1.9rem] leading-none text-[#3b3632]" style={script}>
              The Day
            </span>
            <span className="text-[0.68rem] tracking-[0.2em] text-[#6b625c] uppercase" style={caps}>
              Digital Invitations
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-[#c9a96a]/50 sm:block" aria-hidden />
          <nav className="text-[1.02rem]" style={serif} aria-label="The Day">
            <Link href="/#templates" className="inline-block py-2.5 hover:text-[#2f2925]">
              Templates
            </Link>
            <span className="px-2 text-[#b8913f]" aria-hidden>
              &middot;
            </span>
            <Link href="/pricing" className="inline-block py-2.5 hover:text-[#2f2925]">
              Pricing
            </Link>
            <span className="px-2 text-[#b8913f]" aria-hidden>
              &middot;
            </span>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-block py-2.5 hover:text-[#2f2925]">
              Messenger
            </a>
          </nav>
        </div>
        <p className="text-sm text-[#6b625c]" style={serif}>
          &copy; <CurrentYear /> The Day. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
