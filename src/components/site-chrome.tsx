import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61597006130300";

type Page = "home" | "showcase";

/** Brand header shared by the marketing pages (/ and /showcase). */
export function SiteHeader({ current }: { current: Page }) {
  const link = "hidden rounded-full px-3 py-2 text-[#5c5048] hover:text-[#1f1b18] sm:inline";
  return (
    <header className="site-chrome mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
      <Link href="/" className="script text-3xl leading-none text-[#1f1b18]" aria-label="The Day, home">
        The Day
      </Link>
      <nav className="flex items-center gap-1 text-sm sm:gap-2" aria-label="Main">
        <Link
          href="/showcase"
          aria-current={current === "showcase" ? "page" : undefined}
          className={`${link} aria-[current=page]:text-[#1f1b18] aria-[current=page]:underline aria-[current=page]:decoration-[#a8823f] aria-[current=page]:underline-offset-[6px]`}
        >
          Designs
        </Link>
        <Link href={current === "home" ? "#how" : "/#how"} className={link}>
          How it works
        </Link>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#2f2925]/25 px-4 py-2 font-medium text-[#2f2925] hover:border-[#2f2925]/60"
        >
          Message us
        </a>
      </nav>
    </header>
  );
}

/** Brand footer shared by the marketing pages (/ and /showcase). */
export function SiteFooter() {
  return (
    <footer className="site-chrome border-t border-[#2f2925]/10 bg-[#fbf8f2] text-[#6e5f53]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div>
          <Link href="/" className="script text-3xl leading-none text-[#1f1b18]">
            The Day
          </Link>
          <p className="caps mt-2 text-[#8a7766]">Digital invitations</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.95rem]" aria-label="Footer">
          <Link href="/" className="hover:text-[#1f1b18]">
            Home
          </Link>
          <Link href="/showcase" className="hover:text-[#1f1b18]">
            Designs
          </Link>
          <Link href="/#how" className="hover:text-[#1f1b18]">
            How it works
          </Link>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#1f1b18]"
          >
            <MessageCircle className="size-4" aria-hidden />
            Facebook
          </a>
        </nav>
      </div>
      <p className="border-t border-[#2f2925]/10 px-4 py-4 text-center text-sm">© Bright Labs · Make your day unforgettable.</p>
    </footer>
  );
}
