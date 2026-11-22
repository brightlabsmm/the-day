import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n/numerals";
import { DEMO_GIFT_CAMPAIGN } from "@/lib/gift-demo";
import { GiftSanctuary } from "@/components/gift/sanctuary";
import type { SignupState } from "@/app/g/[slug]/actions";

export const metadata = { title: "Gift invitation preview", robots: { index: false, follow: false } };

/** Signing up in the preview stores nothing. */
async function previewSignup(_prev: SignupState, form: FormData): Promise<SignupState> {
  "use server";
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { status: "error", error: "name" };
  return { status: "ok", name, intention: String(form.get("intention") ?? ""), vipCode: "LOTUSVIP25" };
}

/**
 * Development-only preview of the gift invitation page with the demo
 * campaign, no database needed: /dev/gift?lang=en
 */
export default function GiftPreviewPage(props: PageProps<"/dev/gift">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense>
      <Preview {...props} />
    </Suspense>
  );
}

async function Preview({ searchParams }: PageProps<"/dev/gift">) {
  const query = await searchParams;
  const locale: Locale = query.lang === "my" ? "my" : "en";
  return <GiftSanctuary data={DEMO_GIFT_CAMPAIGN} locale={locale} signupAction={previewSignup} />;
}
