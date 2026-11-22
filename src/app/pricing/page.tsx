import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, MessageCircle, Plus, Sparkles } from "lucide-react";
import { FACEBOOK_URL, SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Three levels of digital wedding invitation. Save up to 50% with our launch offer.",
};

type Level = {
  id: 1 | 2 | 3;
  name: string;
  forWho: string;
  price: number;
  discount: number;
  rounds: number | "unlimited";
  badge?: string;
  featured?: boolean;
  intro: string;
  features: string[];
};

const LEVELS: Level[] = [
  {
    id: 1,
    name: "Essential",
    forWho: "A beautiful invitation, with one link for all your guests.",
    price: 300_000,
    discount: 30,
    rounds: 3,
    intro: "What’s included",
    features: [
      "Your choice of 16 designs",
      "In Burmese and English",
      "A countdown and your schedule",
      "Up to 8 of your photos",
      "Gift QR codes",
      "A wishes wall for your guests",
      "One link to share with everyone",
      "3 rounds of changes",
    ],
  },
  {
    id: 2,
    name: "Signature",
    forWho: "A personal invitation that greets each guest by name.",
    price: 450_000,
    discount: 30,
    rounds: 5,
    badge: "Most popular",
    intro: "Everything in Essential, plus",
    features: [
      "A personal link for every guest",
      "See who has opened their invitation",
      "RSVP: guests reply in a tap",
      "Your story, dress code and FAQ",
      "Background music",
      "5 rounds of changes",
    ],
  },
  {
    id: 3,
    name: "Premium",
    forWho: "Every detail taken care of, for your big day.",
    price: 700_000,
    discount: 50,
    rounds: "unlimited",
    badge: "Best value",
    featured: true,
    intro: "Everything in Signature, plus",
    features: [
      "Your photos turned into an animated video",
      "Find your seat: guests look up their table",
      "Good to know: parking, transport and weather",
      "Your own words on the cover",
      "Priority setup",
      "Unlimited rounds of changes",
    ],
  },
];

/** Rows of the comparison table: true / false, or text per level. */
const COMPARE: { label: string; values: [boolean | string, boolean | string, boolean | string] }[] = [
  { label: "Your choice of 16 designs", values: [true, true, true] },
  { label: "Burmese and English", values: [true, true, true] },
  { label: "Countdown and schedule", values: [true, true, true] },
  { label: "Photos", values: ["Up to 8", "Up to 8", "Up to 8"] },
  { label: "Gift QR codes", values: [true, true, true] },
  { label: "Wishes wall", values: [true, true, true] },
  { label: "Invitation links", values: ["One for everyone", "One per guest", "One per guest"] },
  { label: "See who has opened it", values: [false, true, true] },
  { label: "RSVP replies", values: [false, true, true] },
  { label: "Your story, dress code and FAQ", values: [false, true, true] },
  { label: "Background music", values: [false, true, true] },
  { label: "Animated photo video", values: [false, false, true] },
  { label: "Find your seat", values: [false, false, true] },
  { label: "Good to know tips for guests", values: [false, false, true] },
  { label: "Your own words on the cover", values: [false, false, true] },
  { label: "Priority setup", values: [false, false, true] },
  { label: "Rounds of changes", values: ["3", "5", "Unlimited"] },
];

const FAQ = [
  {
    q: "What counts as one round of changes?",
    a: "Send us all your changes together, such as a new time, a different photo or a spelling fix. We update your invitation and send it back for you to check. That’s one round.",
  },
  {
    q: "Shared link or personal links: what’s the difference?",
    a: "A shared link is a single link for all your guests. With personal links, every guest gets their own link that greets them by name, and you can see who has opened it.",
  },
  {
    q: "Which designs have RSVP and find your seat?",
    a: "Every design except Classic Card. If Classic Card is your favourite, we’ll let you know which features it shows before we start.",
  },
  {
    q: "Can I see the designs first?",
    a: "Of course. Open any design on our designs page and try it on a phone, tablet or desktop, in Burmese or English.",
  },
  {
    q: "How long does the launch offer last?",
    a: "For a limited time only. Message us to book your invitation at today’s price.",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const finalPrice = (l: Level) => Math.round((l.price * (100 - l.discount)) / 100);

export default function PricingPage() {
  return (
    <div className="landing flex min-h-svh flex-col overflow-x-clip bg-[#f6f1e7] text-[#2f2925]">
      <SiteHeader current="pricing" />

      <main className="flex-1">
        {/* Intro */}
        <section className="px-4 pt-8 pb-12 text-center sm:px-8 sm:pt-12">
          <p className="caps text-[#8a7766]">Pricing</p>
          <h1 className="font-display mx-auto mt-3 max-w-3xl text-[clamp(2.3rem,6vw,3.8rem)] leading-[1.05] text-[#1f1b18]">
            One invitation, <span className="script text-[1.15em] text-[#a8823f]">beautifully</span> done
          </h1>
          <span className="mx-auto mt-5 block h-px w-16 bg-[#a8823f]" aria-hidden />
          <p className="mx-auto mt-5 max-w-lg text-lg text-[#5c5048]">
            Pick the level that suits your day. Whichever you choose, we set up the design you love for you, in Burmese and
            English.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#a8823f]/40 bg-[#fbf8f2] px-4 py-2 text-[0.95rem] text-[#7f6129]">
            <Sparkles className="size-4" aria-hidden />
            <span>
              <strong className="font-semibold">Launch offer:</strong> save up to 50% for a limited time
            </span>
          </p>
        </section>

        {/* Level cards */}
        <section aria-label="Levels" className="px-4 pb-16 sm:px-8">
          <ul className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
            {LEVELS.map((l) => (
              <li key={l.id} className="lg:row-span-6 lg:grid lg:grid-rows-subgrid">
                <LevelCard level={l} />
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[#6e5f53]">
            All prices are in Myanmar kyat (MMK), per invitation. Still deciding?{" "}
            <Link href="/showcase" className="underline decoration-[#a8823f] underline-offset-4 hover:text-[#1f1b18]">
              Browse the designs
            </Link>{" "}
            first.
          </p>
        </section>

        {/* Comparison */}
        <section className="border-y border-[#2f2925]/10 bg-[#fbf8f2] px-4 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="caps text-[#8a7766]">Compare levels</p>
              <h2 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight text-[#1f1b18]">
                See what’s included
              </h2>
              <span className="mx-auto mt-4 block h-px w-16 bg-[#a8823f]" aria-hidden />
            </div>
            <div className="mt-10 overflow-x-auto rounded-xl border border-[#2f2925]/10 bg-white">
              <table className="w-full min-w-[560px] border-collapse text-left text-[0.95rem]">
                <caption className="sr-only">Features included in each level</caption>
                <thead>
                  <tr className="border-b border-[#2f2925]/10">
                    <th scope="col" className="px-4 py-4 font-normal text-[#6e5f53] sm:px-6">
                      What you get
                    </th>
                    {LEVELS.map((l) => (
                      <th
                        key={l.id}
                        scope="col"
                        className={`px-3 py-4 text-center ${l.featured ? "bg-[#f6efe1]" : ""}`}
                      >
                        <span className="caps block text-[0.65rem] text-[#8a7766]">Level {l.id}</span>
                        <span className="font-display block text-lg font-semibold text-[#1f1b18]">{l.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-b border-[#2f2925]/[0.06] last:border-0">
                      <th scope="row" className="px-4 py-3 font-normal text-[#2f2925] sm:px-6">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td key={i} className={`px-3 py-3 text-center ${LEVELS[i].featured ? "bg-[#f6efe1]" : ""}`}>
                          <Cell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="px-4 py-4 font-normal text-[#2f2925] sm:px-6">
                      Launch price
                    </th>
                    {LEVELS.map((l) => (
                      <td key={l.id} className={`px-3 py-4 text-center ${l.featured ? "bg-[#f6efe1]" : ""}`}>
                        <span className="font-display block text-xl font-semibold text-[#1f1b18]">{fmt(finalPrice(l))}</span>
                        <span className="block text-xs text-[#8a7766] line-through">{fmt(l.price)}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="caps text-[#8a7766]">Questions</p>
              <h2 className="font-display mt-3 text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight text-[#1f1b18]">
                Questions before you choose
              </h2>
              <span className="mx-auto mt-4 block h-px w-16 bg-[#a8823f]" aria-hidden />
            </div>
            <div className="mt-10 divide-y divide-[#2f2925]/10 border-y border-[#2f2925]/10">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                    <span className="font-display text-xl text-[#1f1b18]">{f.q}</span>
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-[#a8823f]/45 text-[#a8823f] transition duration-300 group-hover:border-[#a8823f] group-open:rotate-45 group-open:border-[#a8823f] group-open:bg-[#a8823f] group-open:text-white"
                      aria-hidden
                    >
                      <Plus className="size-4" strokeWidth={1.75} />
                    </span>
                  </summary>
                  <p className="pb-5 text-[1.02rem] leading-relaxed text-[#5c5048]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-20 sm:px-8 sm:pb-24">
          <div className="paper frame-double mx-auto max-w-3xl px-6 py-12 text-center shadow-[0_18px_40px_-24px_rgba(74,52,38,.45)] sm:px-12">
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight text-[#1f1b18]">
              Not sure which level is right for you?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-[#5c5048]">
              Tell us your wedding date and about how many guests you’re inviting. We’ll suggest a level and send you a
              quote.
            </p>
            <p lang="my" className="mt-2 text-[0.95rem] text-[#6e5f53]">
              မင်္ဂလာဆောင်စီစဉ်နေပါက Message ပို့ပါ။
            </p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2f2925] px-6 py-3.5 font-medium text-[#f6f1e7] hover:bg-[#1f1b18]"
            >
              <MessageCircle className="size-4" aria-hidden />
              Get a quote
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LevelCard({ level: l }: { level: Level }) {
  const price = finalPrice(l);
  const dark = l.featured;
  return (
    <article
      aria-labelledby={`level-${l.id}`}
      className={`relative flex h-full flex-col rounded-2xl p-7 sm:p-8 lg:row-span-6 lg:grid lg:grid-rows-subgrid lg:gap-0 ${
        dark
          ? "bg-[#2f2925] text-[#f6f1e7] shadow-[0_30px_60px_-30px_rgba(47,41,37,.8)]"
          : "border border-[#2f2925]/12 bg-white shadow-[0_16px_36px_-28px_rgba(47,41,37,.6)]"
      }`}
    >
      {l.badge && (
        <span
          className={`caps absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-[0.62rem] whitespace-nowrap ${
            dark ? "bg-[#d9c49a] text-[#2f2925]" : "border border-[#a8823f]/50 bg-[#fbf8f2] text-[#7f6129]"
          }`}
        >
          {l.badge}
        </span>
      )}

      <div className="flex items-baseline justify-between gap-3">
        <p className={`caps ${dark ? "text-[#d9c49a]" : "text-[#8a7766]"}`}>Level {l.id}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            dark ? "bg-[#a8823f] text-white" : "bg-[#a8823f]/12 text-[#7f6129]"
          }`}
        >
          {l.discount}% off
        </span>
      </div>
      <h2 id={`level-${l.id}`} className={`script mt-2 text-5xl leading-none ${dark ? "text-[#f6f1e7]" : "text-[#1f1b18]"}`}>
        {l.name}
      </h2>
      <p className={`mt-3 text-[1.02rem] ${dark ? "text-[#e6dccb]" : "text-[#5c5048]"}`}>{l.forWho}</p>

      <div className="mt-6">
        <p className={`text-sm line-through ${dark ? "text-[#b9ad9c]" : "text-[#8a7766]"}`}>
          <span className="sr-only">Usual price </span>
          {fmt(l.price)} MMK
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="sr-only">Launch price </span>
          <span className={`font-display text-5xl font-semibold tracking-tight ${dark ? "text-white" : "text-[#1f1b18]"}`}>
            {fmt(price)}
          </span>
          <span className={`text-sm ${dark ? "text-[#e6dccb]" : "text-[#5c5048]"}`}>MMK</span>
        </p>
        <p className={`mt-1 text-sm font-medium ${dark ? "text-[#d9c49a]" : "text-[#7f6129]"}`}>
          You save {fmt(l.price - price)} MMK
        </p>
      </div>

      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-medium transition ${
          dark
            ? "bg-[#d9c49a] text-[#2f2925] hover:bg-[#e6d4ad]"
            : "border border-[#2f2925]/30 text-[#2f2925] hover:border-[#2f2925] hover:bg-[#2f2925] hover:text-[#f6f1e7]"
        }`}
      >
        Choose Level {l.id}
        <ArrowRight className="size-4" aria-hidden />
      </a>

      <div>
        <span className={`mt-8 block h-px ${dark ? "bg-[#f6f1e7]/15" : "bg-[#2f2925]/10"}`} aria-hidden />
        <p className={`mt-6 text-sm font-medium ${dark ? "text-[#d9c49a]" : "text-[#7f6129]"}`}>{l.intro}</p>
        <ul className="mt-3 space-y-2.5">
          {l.features.map((f) => (
            <li key={f} className="flex gap-3 text-[0.98rem] leading-snug">
              <Check className={`mt-0.5 size-4 shrink-0 ${dark ? "text-[#d9c49a]" : "text-[#a8823f]"}`} aria-hidden />
              <span className={dark ? "text-[#f1e9dc]" : "text-[#2f2925]"}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <>
        <Check className="mx-auto size-4 text-[#a8823f]" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus className="mx-auto size-4 text-[#2f2925]/25" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-[#2f2925]">{value}</span>;
}
