import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Gift,
  Images,
  Languages,
  Link2,
  MessageCircle,
  MessageCircleHeart,
  Sparkles,
  Ticket,
} from "lucide-react";
import { FACEBOOK_URL, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { FeaturedCouples } from "@/components/featured-couples";


const FEATURES = [
  { icon: Link2, title: "A link for every guest", text: "Each guest opens an invitation with their own name on it." },
  { icon: Languages, title: "Burmese and English", text: "Guests switch language with one tap." },
  { icon: CalendarClock, title: "Countdown and schedule", text: "Every event of the day, with times and venues." },
  { icon: Images, title: "Your photos", text: "A gallery of your favourite pictures together." },
  { icon: Gift, title: "Gift QR codes", text: "Guests can send a gift from their banking app." },
  { icon: MessageCircleHeart, title: "Wishes wall", text: "Guests leave messages for you to keep." },
  { icon: Ticket, title: "RSVP and seating", text: "Replies and table finder, on our newest designs." },
  { icon: Sparkles, title: "An opening moment", text: "Envelopes, curtains and lanterns that open like a real card." },
];

const STEPS = [
  { title: "Pick a design", text: "Browse all sixteen and open any of them on your phone." },
  { title: "Send us your details", text: "Names, dates, venues, photos and your guest list." },
  { title: "Share the links", text: "Send each guest their link on Viber, Messenger or Telegram." },
];

export default function Home() {
  return (
    <div className="landing min-h-svh overflow-x-clip bg-[#f6f1e7] text-[#2f2925]">
      <SiteHeader current="home" />

      {/* Hero */}
      <section className="relative">
        <Thread className="pointer-events-none absolute bottom-0 left-0 hidden h-[140px] w-full text-[#a8823f] lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-6 pb-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-10 lg:pb-24">
          <div className="text-center lg:text-left">
            <p className="caps text-[#5c5048]">Digital invitations</p>
            <h1 className="script mt-4 text-[clamp(4.5rem,14vw,8.5rem)] leading-[0.9] text-[#1f1b18]">The Day</h1>
            <span className="mx-auto mt-6 block h-px w-24 bg-[#a8823f] lg:mx-0" aria-hidden />
            <p className="font-display mt-6 text-[clamp(1.5rem,3.4vw,2.1rem)] leading-snug text-[#2f2925]">
              Make your day unforgettable.
            </p>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-[#5c5048] lg:mx-0">
              Wedding invitations that open like a real card, with your names, date, venue and photos. Every guest gets
              their own link.
            </p>
            <p lang="my" className="mt-3 text-[0.95rem] text-[#6e5f53]">
              မင်္ဂလာဖိတ်စာ ဒစ်ဂျစ်တယ် · မြန်မာ / English
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/showcase"
                className="inline-flex items-center gap-2 rounded-full bg-[#2f2925] px-6 py-3.5 font-medium text-[#f6f1e7] shadow-[0_10px_24px_-12px_rgba(47,41,37,.7)] transition hover:bg-[#1f1b18]"
              >
                Browse all 16 designs
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-medium text-[#2f2925] underline decoration-[#a8823f] decoration-1 underline-offset-[6px] hover:decoration-2"
              >
                <MessageCircle className="size-4" aria-hidden />
                Message us on Facebook
              </a>
            </div>
          </div>

          <HeroPhone />
        </div>
      </section>

      {/* Real couples */}
      <Suspense fallback={null}>
        <FeaturedCouples />
      </Suspense>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <SectionHeading eyebrow="In every invitation" title="Everything your guests need, in one link" />
          <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="size-6 text-[#a8823f]" strokeWidth={1.5} aria-hidden />
                <h3 className="font-display mt-3 text-xl font-semibold text-[#1f1b18]">{title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-[#5c5048]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-6 bg-[#fbf8f2] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <SectionHeading eyebrow="How it works" title="Ready in three steps" />
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="text-center">
                <span className="script block text-5xl leading-none text-[#a8823f]">{i + 1}</span>
                <h3 className="font-display mt-3 text-xl font-semibold text-[#1f1b18]">{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[16rem] text-[0.95rem] leading-relaxed text-[#5c5048]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-4 py-20 text-center sm:px-8 sm:py-24">
        <EnvelopeMark className="mx-auto h-20 w-28 text-[#2f2925]" />
        <h2 className="font-display mx-auto mt-6 max-w-xl text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight text-[#1f1b18]">
          Planning a wedding?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-[#5c5048]">
          Message us on Facebook and we’ll help you choose a design and set up your invitation.
        </p>
        <p lang="my" className="mt-2 text-[0.95rem] text-[#6e5f53]">
          မင်္ဂလာဆောင်စီစဉ်နေပါက Message ပို့ပါ။
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f2925] px-6 py-3.5 font-medium text-[#f6f1e7] hover:bg-[#1f1b18]"
          >
            <MessageCircle className="size-4" aria-hidden />
            Message us on Facebook
          </a>
          <Link href="/showcase" className="rounded-full px-5 py-3.5 font-medium underline decoration-[#a8823f] underline-offset-[6px]">
            Browse designs
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="caps text-[#8a7766]">{eyebrow}</p>
      <h2 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight text-[#1f1b18]">{title}</h2>
      <span className="mx-auto mt-4 block h-px w-16 bg-[#a8823f]" aria-hidden />
      {children && <p className="mx-auto mt-4 max-w-lg text-[1.05rem] text-[#5c5048]">{children}</p>}
    </div>
  );
}

/** A real demo invitation in a phone frame (390×844 shown at 60%). */
function HeroPhone() {
  return (
    <div className="relative mx-auto w-fit">
      <EnvelopeMark className="absolute -bottom-6 -left-24 hidden h-28 w-40 -rotate-6 text-[#2f2925] sm:block" />
      <div className="relative rounded-[2.6rem] border-[9px] border-[#1f1b18] bg-[#1f1b18] shadow-[0_40px_70px_-30px_rgba(47,41,37,.75)]">
        <div className="relative h-[506px] w-[234px] overflow-hidden rounded-[2rem] bg-white">
          <iframe
            title="Wildflower design, demo invitation"
            src="/w/showcase-wildflower?lang=en&preview=1"
            loading="lazy"
            tabIndex={-1}
            className="pointer-events-none absolute top-0 left-0 h-[844px] w-[390px] origin-top-left scale-[0.6] border-0"
          />
        </div>
      </div>
      <Link
        href="/w/showcase-wildflower?lang=en"
        target="_blank"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm text-[#5c5048] underline underline-offset-4 hover:text-[#1f1b18]"
      >
        Open this demo
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

/** Line-drawn envelope with a gold heart seal, after the brand cover. */
function EnvelopeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <rect x="6" y="14" width="148" height="90" rx="4" fill="#fbf8f2" />
        <path d="M8 17 80 66 152 17" />
        <path d="M8 101 62 54M152 101 98 54" opacity=".55" />
      </g>
      <path d="M80 64c-8-5.5-10-11-6-12.6 2.6-1 4.9.4 6 2.4 1.1-2 3.4-3.4 6-2.4 4 1.6 2 7.1-6 12.6Z" fill="#a8823f" />
    </svg>
  );
}

/** The looping gold thread from the brand cover, running behind the hero. */
function Thread({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className={className} fill="none" aria-hidden>
      <path
        d="M0 60C120 50 200 70 260 110c40 28 30 60 8 58-24-2-16-40 24-44 70-8 120 60 220 70M980 210c120 0 200-30 260-80 24-20 10-46-10-38-22 8-4 38 30 40 60 4 110-40 180-60"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".75"
      />
    </svg>
  );
}
