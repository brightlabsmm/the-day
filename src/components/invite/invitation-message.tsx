/*
 * Invitation message, after page 3 of the printed card: optionally each
 * partner's family lineage with their name in gold and credentials, then the
 * couple's invitation text.
 */
import { z } from "zod";
import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { InnerCard } from "./inner-card";

const i18n = z.object({ my: z.string().optional(), en: z.string().optional() }).partial();
const Side = z
  .object({ lineage: i18n.optional(), credentials: z.string().optional() })
  .partial()
  .optional();
const Family = z.object({ partner_one: Side, partner_two: Side }).partial();

export function InvitationMessage({
  invitation,
  locale,
  plain,
}: {
  invitation: Invitation;
  locale: Locale;
  plain?: boolean;
}) {
  const { wedding } = invitation;
  const family = Family.safeParse(wedding.family).data ?? {};
  const message = t(wedding.invitation_text, locale);
  // Lineage is personal wording in one language: it is never swapped for the other language.
  const lineage = (side: "partner_one" | "partner_two") => family[side]?.lineage?.[locale] ?? "";
  const hasLineage = !!(lineage("partner_one") || lineage("partner_two"));

  return (
    <InnerCard id="invitation-heading" anchor="invitation" plain={plain} heading={s("invitationHeading", locale)} lang={locale}>
      {hasLineage ? (
        <div className="mt-5">
          <Partner lineage={lineage("partner_one")} name={t(wedding.partner_one_name, locale)} credentials={family.partner_one?.credentials} />
          <p className="card-body my-3">{s("and", locale)}</p>
          <Partner lineage={lineage("partner_two")} name={t(wedding.partner_two_name, locale)} credentials={family.partner_two?.credentials} />
        </div>
      ) : (
        <div className="mt-5">
          <p className="card-gold-name foil">{t(wedding.partner_one_name, locale)}</p>
          <p className="card-body my-1">{s("and", locale)}</p>
          <p className="card-gold-name foil">{t(wedding.partner_two_name, locale)}</p>
        </div>
      )}

      {message && <p className="card-body mt-6 whitespace-pre-line text-ink">{message}</p>}
    </InnerCard>
  );
}

function Partner({ lineage, name, credentials }: { lineage: string; name: string; credentials?: string }) {
  return (
    <div>
      {lineage && (
        <p className="card-body">
          <Lineage text={lineage} />
        </p>
      )}
      <p className="card-gold-name foil mt-2">{name}</p>
      {credentials && (
        <p lang="en" className="font-display mt-0.5 text-[1.05rem] text-navy">
          {credentials}
        </p>
      )}
    </div>
  );
}

/**
 * Lineage lines keep each whitespace-separated piece (a parent, or a pair such as
 * "Ko A+Ma B,") on one line; a line only wraps between pieces, never inside a name.
 */
function Lineage({ text }: { text: string }) {
  return text.split("\n").map((line, i) => (
    <span key={i} className="block">
      {line
        .split(/\s+/)
        .filter(Boolean)
        .map((piece, j) => (
          <span key={j}>
            {j > 0 && " "}
            <span className="whitespace-nowrap">{piece}</span>
          </span>
        ))}
    </span>
  ));
}
