import type { Metadata } from "next";
import { TEMPLATES, occasionOfTemplate } from "@/lib/templates";
import { ShowcaseGallery, type ShowcaseDesign } from "@/components/showcase/gallery";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Page designs",
  description: "Choose how your invitation looks. Interactive designs for weddings, birthdays and sacred gift sanctuaries in Burmese and English.",
};

const LOTUS_SANCTUARY_DESIGN: ShowcaseDesign = {
  key: "lotus-sanctuary",
  name: "The Lotus Sanctuary",
  mood: "Sacred Pond · 12 Launch Blessings · Interactive Pollen",
  blurb: "A mystical night pond with twelve sacred blessings to unlock. Tap blooming lotus petals, explore the celestial astrolabe, or draw oracle cards with rising pollen animations, singing bowl chimes, and a wax-sealed VIP invitation pass.",
  category: "gift",
  previewUrl: "/g/lotus-sanctuary",
  viewUrl: "/g/lotus-sanctuary",
};

/** Live previews of every design, including wedding invitations and gift sanctuaries. */
export default function ShowcasePage() {
  const designs: ShowcaseDesign[] = [
    ...TEMPLATES.map((t) => ({
      key: t.key,
      name: t.name,
      mood: t.mood,
      blurb: t.blurb,
      category: occasionOfTemplate(t.key),
    })),
    LOTUS_SANCTUARY_DESIGN,
  ];

  return (
    <div className="flex min-h-svh flex-col bg-[#f4efe6] text-[#4a3a2e]">
      <SiteHeader current="showcase" />
      <main className="flex-1 px-4 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="label-caps text-xs text-[#8a7766]">{designs.length} designs</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,6vw,3.6rem)] leading-tight font-semibold">Choose your invitation</h1>
          <p className="mx-auto mt-4 max-w-xl text-[1.05rem] text-[#6e5f53] sm:text-lg">
            {designs.length} interactive designs across wedding and birthday invitations and sacred gift sanctuaries, each in Burmese and English. Switch the screen size to see how each one adapts.
          </p>
        </header>

        <ShowcaseGallery designs={designs} />
      </main>
      <SiteFooter />
    </div>
  );
}
