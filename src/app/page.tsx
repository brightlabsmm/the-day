import { DoubleRule, Flourish } from "@/components/ornaments";

export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <section className="paper frame-double w-full max-w-sm px-8 py-14 text-center text-navy shadow-[0_18px_40px_-24px_rgba(74,52,38,.55)]">
        <p className="label-caps text-ink-soft">Bright Labs</p>
        <DoubleRule className="mx-auto mt-6 w-full text-navy" />
        <h1 className="foil font-display mt-4 text-5xl font-semibold tracking-[0.06em]">THE DAY</h1>
        <DoubleRule className="mx-auto mt-4 w-full text-navy" />
        <p className="font-display mt-6 text-xl italic text-ink">Make Your Day Unforgettable.</p>
        <Flourish className="mx-auto mt-6 text-gold" />
        <p lang="my" className="mt-4 text-sm text-ink-soft">
          မင်္ဂလာဖိတ်စာ ဒစ်ဂျစ်တယ်
        </p>
      </section>
    </main>
  );
}
