import type { Invitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { Cover } from "./cover";
import { InvitationMessage } from "./invitation-message";
import { WeddingDetails } from "./wedding-details";
import { Countdown } from "./countdown";
import { GallerySection } from "./gallery-section";
import { WishesSection } from "./wishes-section";
import { formatLongDate, formatTimeRange } from "@/lib/i18n/datetime";

/** Everything under the sleeve, in reading order. Sections are added milestone by milestone. */
export function InvitationBody({
  invitation,
  locale,
  monogram,
  token,
}: {
  invitation: Invitation;
  locale: Locale;
  monogram: string;
  token: string | null;
}) {
  const main = invitation.events.find((e) => e.kind === "ceremony") ?? invitation.events[0];

  return (
    <main
      lang={locale}
      className="mx-auto w-full max-w-[440px] px-3 pt-12 pb-16 sm:pt-16 sm:drop-shadow-[0_24px_40px_rgba(74,52,38,.18)]"
    >
      <Cover invitation={invitation} locale={locale} monogram={monogram} />
      <InvitationMessage invitation={invitation} locale={locale} />
      <WeddingDetails invitation={invitation} locale={locale} />
      {main && (
        <Countdown
          targetIso={main.starts_at}
          locale={locale}
          label={`${formatLongDate(main.starts_at, invitation.wedding.timezone, locale)} · ${formatTimeRange(main.starts_at, null, invitation.wedding.timezone, locale)}`}
        />
      )}
      <GallerySection invitation={invitation} locale={locale} />
      <WishesSection invitation={invitation} locale={locale} token={token} />
    </main>
  );
}
