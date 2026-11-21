import type { Metadata } from "next";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Page designs",
  description: "Choose how your wedding invitation looks. Four designs, all in Burmese and English.",
};

/** Live previews of every design, using the fictional demo weddings (pnpm seed:showcase). */
export default function ShowcasePage() {
  return (
    <main className="min-h-svh bg-[#f4efe6] px-4 py-14 text-[#4a3a2e] sm:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-xs text-[#8a7766]">THE DAY · Bright Labs</p>
        <h1 className="font-display mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-tight font-semibold">Choose your invitation</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[#6e5f53]">
          Four designs for the same invitation, each in Burmese and English with a countdown, schedule, photos, gift QR
          codes and a wishes wall. The couples shown are made up.
        </p>
      </header>

      <ul className="mx-auto mt-14 grid max-w-6xl gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {TEMPLATES.map((t) => (
          <li key={t.key} className="flex flex-col items-center text-center">
            <div className="w-full max-w-[300px] rounded-[2.2rem] border-[7px] border-[#2a2420] bg-[#2a2420] shadow-[0_28px_50px_-24px_rgba(42,36,32,.6)]">
              <iframe
                title={`${t.name} design preview`}
                src={`/w/showcase-${t.key}?lang=en`}
                loading="lazy"
                className="block h-[560px] w-full rounded-[1.6rem] bg-white"
              />
            </div>
            <h2 className="font-display mt-6 text-2xl font-semibold">{t.name}</h2>
            <p className="label-caps mt-1 text-[0.65rem] text-[#8a7766]">{t.mood}</p>
            <p className="mt-3 max-w-[18rem] text-[0.95rem] leading-relaxed text-[#6e5f53]">{t.blurb}</p>
            <div className="mt-4 flex gap-5 text-sm underline underline-offset-4">
              <a href={`/w/showcase-${t.key}?lang=en`} target="_blank" rel="noopener noreferrer">
                Open in English
              </a>
              <a href={`/w/showcase-${t.key}?lang=my`} target="_blank" rel="noopener noreferrer" lang="my">
                မြန်မာဖြင့်ကြည့်ရန်
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
