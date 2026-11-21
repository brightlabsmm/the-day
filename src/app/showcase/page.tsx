import type { Metadata } from "next";
import { TEMPLATES } from "@/lib/templates";
import { ShowcaseGallery } from "@/components/showcase/gallery";

export const metadata: Metadata = {
  title: "Page designs",
  description: "Choose how your wedding invitation looks. Nine designs, all in Burmese and English.",
};

/** Live previews of every design, using the fictional demo weddings (pnpm seed:showcase). */
export default function ShowcasePage() {
  return (
    <main className="min-h-svh bg-[#f4efe6] px-4 py-12 text-[#4a3a2e] sm:px-8 sm:py-14">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-xs text-[#8a7766]">THE DAY · Bright Labs</p>
        <h1 className="font-display mt-3 text-[clamp(2rem,6vw,3.6rem)] leading-tight font-semibold">Choose your invitation</h1>
        <p className="mx-auto mt-4 max-w-xl text-[1.05rem] text-[#6e5f53] sm:text-lg">
          Nine designs for the same invitation, each in Burmese and English with a countdown, schedule, photos, gift QR
          codes and a wishes wall. Switch the screen size to see how each one adapts. The couples shown are made up.
        </p>
      </header>

      <ShowcaseGallery designs={TEMPLATES.map((t) => ({ key: t.key, name: t.name, mood: t.mood, blurb: t.blurb }))} />
    </main>
  );
}
