import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { Flourish } from "@/components/ornaments";

/** The couple's closing words, from the back of the printed card. */
export function ClosingQuote({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const quote = t(invitation.wedding.closing_quote, locale);
  if (!quote) return null;
  return (
    <figure lang={locale} className="mt-8 px-6 text-center text-navy">
      <Flourish className="mx-auto text-gold" />
      <blockquote className="card-body mt-4 whitespace-pre-line text-ink">&ldquo;{quote}&rdquo;</blockquote>
    </figure>
  );
}
