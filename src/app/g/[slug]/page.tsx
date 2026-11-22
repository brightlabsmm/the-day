import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/numerals";
import { getGiftCampaign } from "@/lib/gift-server";
import { GiftSanctuary } from "@/components/gift/sanctuary";
import { submitGiftSignup } from "./actions";

/** Link previews show the campaign title only. Pages are not indexed. */
export async function generateMetadata({ params }: PageProps<"/g/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGiftCampaign(slug);
  if (!data) return { title: "Gift invitation", robots: { index: false, follow: false } };
  const title = t(data.campaign.title, "en") || "Gift invitation";
  const description = t(data.campaign.subtitle, "en") || "Twelve gifts are waiting for you.";
  return { title, description, robots: { index: false, follow: false }, openGraph: { type: "website", title, description } };
}

export default function GiftPage(props: PageProps<"/g/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#03070c]" />}>
      <GiftRoute {...props} />
    </Suspense>
  );
}

async function GiftRoute({ params, searchParams }: PageProps<"/g/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = resolveLocale(query.lang, (await cookies()).get(LOCALE_COOKIE)?.value);
  const data = await getGiftCampaign(slug);
  if (!data || data.items.length === 0) notFound();
  return <GiftSanctuary data={data} locale={locale} signupAction={submitGiftSignup.bind(null, data.campaign.slug)} />;
}
