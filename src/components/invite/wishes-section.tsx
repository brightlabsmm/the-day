import type { Invitation } from "@/lib/invitation";
import { getPublicWishes, getWishes } from "@/lib/wishes";
import { type Locale } from "@/lib/i18n/numerals";
import { guestName, s } from "@/lib/i18n/strings";
import { InnerCard } from "./inner-card";
import { WishForm } from "./wish-form";

type Entry = { author_name: string; message: string; created_at: string; is_mine?: boolean };

/**
 * Blessings from guests. With public_wishes on, everyone with the link can
 * read and add wishes. Otherwise only guests opening their own link can.
 */
export async function WishesSection({
  invitation,
  locale,
  token,
  plain,
  heading,
  intro,
}: {
  invitation: Invitation;
  locale: Locale;
  token: string | null;
  plain?: boolean;
  /** A design's own heading. The section then has no card around it, so the design can style it all. */
  heading?: React.ReactNode;
  /** Replaces the default line above the form ("Leave a blessing for the couple"). */
  intro?: string;
}) {
  const { wedding, guest } = invitation;
  if (!wedding.wishes_enabled) return null;

  if (wedding.public_wishes) {
    const wishes = await getPublicWishes(wedding.slug);
    return (
      <Card locale={locale} wishes={wishes} plain={plain} heading={heading}>
        <WishForm mode="public" slug={wedding.slug} locale={locale} defaultName="" intro={intro} />
      </Card>
    );
  }

  if (!guest || !token) return null;
  const wishes = await getWishes(wedding.slug, token);
  const mine = wishes.find((w) => w.is_mine) ?? null;
  return (
    <Card locale={locale} wishes={wishes} plain={plain} heading={heading}>
      <WishForm
        mode="guest"
        slug={wedding.slug}
        token={token}
        locale={locale}
        defaultName={mine?.author_name ?? guestName(guest, locale)}
        existing={mine?.message ?? null}
        canEdit={wedding.wishes_editable}
        intro={intro}
      />
    </Card>
  );
}

function Card({
  locale,
  wishes,
  children,
  plain,
  heading,
}: {
  locale: Locale;
  wishes: Entry[];
  children: React.ReactNode;
  plain?: boolean;
  heading?: React.ReactNode;
}) {
  const list = (
    <ul className="wish-list mt-8 space-y-4 text-left">
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
  );
  if (heading) {
    return (
      <section id="wishes" aria-labelledby="wishes-heading" lang={locale} className="wishes-own">
        {heading}
        {children}
        {list}
      </section>
    );
  }
  return (
    <InnerCard id="wishes-heading" anchor="wishes" plain={plain} heading={s("wishesHeading", locale)} lang={locale}>
      {children}
      {list}
    </InnerCard>
  );
}
