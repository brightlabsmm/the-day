import { notFound } from "next/navigation";
import { DoubleRule, Flourish, MonogramSeal, Rule } from "@/components/ornaments";
import { toMyanmarDigits } from "@/lib/i18n/numerals";

export const metadata = { title: "Design foundation" };

const SWATCHES = [
  ["Vintage Ivory", "bg-ivory", "#F5EBDD"],
  ["Warm Paper", "bg-paper", "#EDE0CA"],
  ["Deep Cocoa", "bg-cocoa", "#4A3426"],
  ["Antique Gold", "bg-gold", "#A8823F"],
  ["Soft Gold", "bg-gold-soft", "#D9C49A"],
  ["Muted Navy", "bg-navy", "#414A67"],
  ["Dark Brown Text", "bg-ink", "#493B32"],
] as const;

/** Development-only sheet showing the design tokens. */
export default function FoundationPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <article className="paper frame-double px-6 py-10 text-navy">
        {/* Cover header, after page 1 of the printed card */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="label-caps text-[0.55rem] leading-relaxed">
            Our
            <br />
            Special
            <br />
            Day
          </p>
          <MonogramSeal monogram="T&M" className="size-[72px] text-[1.9rem] text-navy" />
          <p className="label-caps text-right text-[0.55rem] leading-relaxed">
            Together
            <br />
            Forever
            <br />
            Est. 2027
          </p>
        </header>

        <DoubleRule className="mt-6" />
        <h1 className="foil font-display my-2 text-center text-[clamp(1.4rem,7.4vw,2.6rem)] leading-none font-bold tracking-[0.01em] whitespace-nowrap">
          THE WEDDING DAY
        </h1>
        <DoubleRule />
        <p className="label-caps mt-3 text-center text-[0.6rem]">Two hearts / One journey / Forever</p>

        <div className="mt-8 text-center">
          <p className="foil font-display text-4xl font-semibold">Thukha</p>
          <div className="my-1 flex items-center gap-3 text-navy">
            <Rule className="flex-1" />
            <span className="font-display text-xl italic text-gold">and</span>
            <Rule className="flex-1" />
          </div>
          <p className="foil font-display text-4xl font-semibold">May Thet</p>
        </div>

        <Flourish className="mx-auto mt-8 text-navy" />

        {/* Burmese specimen, after the inner cards */}
        <section lang="my" className="mt-6 text-center">
          <h2 className="text-lg font-medium text-navy">မင်္ဂလာအစီအစဉ်</h2>
          <p className="mt-3 text-[0.95rem] text-ink">
            မိသားစုများနှင့်အတူ ကျွန်ုပ်တို့၏ မင်္ဂလာအခမ်းအနားသို့ ကြွရောက်ချီးမြှင့်ပေးပါရန် လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်။
          </p>
          <p className="mt-3 text-ink">
            {toMyanmarDigits("13-2-2027")} · နံနက် ({toMyanmarDigits("11:30")}) နာရီ
          </p>
        </section>

        <div className="mt-6 border border-dashed border-navy/50 px-4 py-3 text-center">
          <p className="label-caps text-[0.6rem] text-ink-soft">Jost · supporting labels</p>
          <p className="font-label mt-1 text-sm text-ink">Saturday, 13 February 2027 · 11:30 AM</p>
        </div>
      </article>

      <section className="mt-8 grid grid-cols-2 gap-3">
        {SWATCHES.map(([name, cls, hex]) => (
          <div key={name} className="flex items-center gap-3">
            <span className={`size-9 shrink-0 border border-ink/20 ${cls}`} />
            <span className="font-label text-xs leading-tight text-ink">
              {name}
              <br />
              <span className="text-ink-soft">{hex}</span>
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
