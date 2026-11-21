import type { Invitation } from "@/lib/invitation";
import { getWishes } from "@/lib/wishes";
import { type Locale } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { InnerCard } from "./inner-card";
import { WishForm } from "./wish-form";

/** Blessings from guests. Shown only to guests opening their own link. */
export async function WishesSection({
  invitation,
  locale,
  token,
}: {
  invitation: Invitation;
  locale: Locale;
  token: string | null;
}) {
  const { wedding, guest } = invitation;
  if (!wedding.wishes_enabled || !guest || !token) return null;

  const wishes = await getWishes(wedding.slug, token);
  const mine = wishes.find((w) => w.is_mine) ?? null;

  return (
    <InnerCard id="wishes-heading" heading={s("wishesHeading", locale)} lang={locale}>
      <WishForm
        slug={wedding.slug}
        token={token}
        locale={locale}
        defaultName={mine?.author_name ?? guestName(guest, locale)}
        existing={mine?.message ?? null}
        canEdit={wedding.wishes_editable}
      />

      <ul className="mt-8 space-y-4 text-left">
        {wishes.length === 0 && <li className="card-body text-center">{s("wishEmpty", locale)}</li>}
        {wishes.map((w, i) => (
          <li key={`${w.created_at}-${i}`} className="border-t border-navy/25 pt-3">
            <p className="card-body whitespace-pre-line break-words text-ink">{w.message}</p>
            <p className="label-caps mt-1 text-ink-soft">
              — {w.author_name}
              {w.is_mine && ` (${s("wishYou", locale)})`}
            </p>
          </li>
        ))}
      </ul>
    </InnerCard>
  );
}
