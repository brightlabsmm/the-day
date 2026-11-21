import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";
import { getInvitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { t } from "@/lib/i18n/numerals";
import { guestName } from "@/lib/i18n/strings";
import { Opening } from "@/components/invite/opening";
import { SleeveShell } from "@/components/invite/sleeve-parts";
import { InvitationBody } from "@/components/invite/invitation-body";
import { LanguageSwitch } from "@/components/invite/language-switch";
import { markOpened } from "./actions";

export default function InvitationPage(props: PageProps<"/w/[slug]">) {
  return (
    <Suspense fallback={<SleeveShell />}>
      <InvitationRoute {...props} />
    </Suspense>
  );
}

async function InvitationRoute({ params, searchParams }: PageProps<"/w/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const token = typeof query.g === "string" ? query.g : undefined;
  const locale: Locale = resolveLocale(query.lang, (await cookies()).get(LOCALE_COOKIE)?.value);

  const invitation = await getInvitation(slug, token);
  if (!invitation) notFound();

  const { wedding, guest } = invitation;
  const monogram =
    wedding.monogram ??
    `${t(wedding.partner_one_name, "en").charAt(0)}&${t(wedding.partner_two_name, "en").charAt(0)}`;

  return (
    <>
    <LanguageSwitch locale={locale} />
    <Opening
      slug={wedding.slug}
      token={guest ? (token ?? null) : null}
      locale={locale}
      monogram={monogram}
      guestLabel={guestName(guest, locale)}
      coupleNames={{ one: t(wedding.partner_one_name, locale), two: t(wedding.partner_two_name, locale) }}
      onOpenAction={markOpened}
    >
      <InvitationBody invitation={invitation} locale={locale} monogram={monogram} />
    </Opening>
    </>
  );
}
