import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInvitation, type Invitation } from "@/lib/invitation";
import { resolveLocale } from "@/lib/i18n/locale";
import { BloomPage } from "@/components/templates/bloom-page";
import { TheDayFooter } from "@/components/the-day-footer";
import { markOpened } from "@/app/w/[slug]/actions";

export const metadata = { title: "Birthday preview", robots: { index: false, follow: false } };

/**
 * Development only: Watercolour Bloom as "Sacha's 1st Birthday", with the baby photo and painted
 * pieces from supabase/seed-media/bloom. The rest of a published demo is borrowed (read only) as a
 * base; nothing is written, and its link code does not exist, so the forms cannot save anything.
 * Open /dev/bloom or /dev/bloom?lang=my.
 */
export default function BloomPreview(props: PageProps<"/dev/bloom">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview {...props} />
    </Suspense>
  );
}

const ev = (id: string, time: string, kind: "ceremony" | "reception" | "other", en: string, my: string) => ({
  id,
  kind,
  title: { en, my },
  starts_at: new Date(`2030-06-15T${time}:00+06:30`).toISOString(),
  ends_at: null,
  myanmar_date_text: {},
  venue_name: { en: "Rose Garden Café", my: "နှင်းဆီဥယျာဉ် ကဖေး" },
  venue_address: { en: "No. 12, Inya Road, Yangon", my: "အမှတ် ၁၂၊ အင်းယားလမ်း၊ ရန်ကုန်မြို့" },
  map_url: "https://www.google.com/maps/search/?api=1&query=Inya+Road+Yangon",
});

async function Preview({ searchParams }: PageProps<"/dev/bloom">) {
  const q = await searchParams;
  const locale = resolveLocale(q.lang, undefined);
  const from = typeof q.from === "string" ? q.from : "showcase-garden";
  const base = await getInvitation(from, undefined);
  if (!base) return <p className="p-8">Could not load the demo “{from}” to borrow its photos.</p>;

  const invitation: Invitation = {
    ...base,
    guest: null,
    wedding: {
      ...base.wedding,
      slug: "dev-bloom-preview",
      template_key: "bloom",
      partner_one_name: { en: "Sacha", my: "ဆာချာ" },
      partner_two_name: {},
      monogram: "S",
      tagline: { en: "Our little one turns one", my: "ကျွန်ုပ်တို့ သမီးလေး တစ်နှစ်ပြည့်ပြီ" },
      invitation_text: {
        en: "One year of giggles, first steps and sleepy cuddles. Please join us for cake, games and lots of love as Sacha turns one. [Sample wording]",
        my: "ရယ်မောသံ၊ ပထမဆုံး ခြေလှမ်းများနှင့် ပြည့်နှက်ခဲ့သော တစ်နှစ်တာ။ ဆာချာ၏ ပထမ မွေးနေ့ပွဲသို့ ကြွရောက်ပေးကြပါ။ [နမူနာစာသား]",
      },
      closing_quote: { en: "Thank you for loving our little one.", my: "ကျွန်ုပ်တို့ သမီးလေးကို ချစ်ခင်ပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်။" },
      cover_text: {
        occasion: "birthday",
        rsvp_contact: "+95 9 123 456 789",
        age: { en: "1st", my: "ပထမ" },
        art: {
          corner: { p: "/dev/bloom/art/corner.png", w: 658, h: 800 },
          wreath: { p: "/dev/bloom/art/wreath.png", w: 800, h: 788 },
          watercolor: { p: "/dev/bloom/art/watercolor.jpg", w: 1600, h: 1600 },
        },
      },
      rsvp_enabled: true,
      wishes_enabled: true,
      public_wishes: true,
      faq: [
        { q: { en: "Can I bring my children?", my: "ကလေးများ ခေါ်လာနိုင်ပါသလား?" }, a: { en: "Of course! There will be games and a play corner.", my: "ခေါ်လာနိုင်ပါသည်။ ကစားစရာ ထောင့်လေး ရှိပါသည်။" } },
        { q: { en: "Is parking available?", my: "ကားရပ်နားရန် နေရာရှိပါသလား?" }, a: { en: "Yes, free parking at the café.", my: "ရှိပါသည်။ ကဖေးတွင် အခမဲ့ ရပ်နားနိုင်ပါသည်။" } },
      ],
    },
    // Only the baby photo from the card; the borrowed demo's wedding photos are not used.
    photos: [{ id: "baby", storage_path: "/dev/bloom/art/cover.jpg", width: 800, height: 534, kind: "couple", alt: { en: "Sacha", my: "ဆာချာ" }, is_cover: true }],
    events: [ev("e1", "15:00", "ceremony", "Birthday party", "မွေးနေ့ပွဲ"), ev("e2", "16:00", "other", "Cake cutting", "ကိတ်မုန့် ဖြတ်ခြင်း"), ev("e3", "16:30", "reception", "Tea and games", "လက်ဖက်ရည်နှင့် ကစားပွဲ")],
  };

  return (
    <>
      <BloomPage invitation={invitation} locale={locale} monogram="S" token={null} onOpenAction={markOpened} preview />
      <TheDayFooter />
    </>
  );
}
