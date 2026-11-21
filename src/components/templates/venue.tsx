import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";

/** Venue name, address and a directions button for each distinct venue. */
export function Venue({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const venues = invitation.events
    .filter((e) => t(e.venue_name, locale))
    .filter((e, i, all) => all.findIndex((o) => t(o.venue_name, "en") === t(e.venue_name, "en")) === i);
  if (venues.length === 0) return null;

  return (
    <section id="venue" aria-labelledby="venue-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow text-center">
        <p className="tpl-eyebrow">{s("venueEyebrow", locale)}</p>
        <h2 id="venue-heading" className="tpl-h2">
          {s("venueHeading", locale)}
        </h2>
        <div className="mt-10 space-y-12">
          {venues.map((e) => (
            <div key={e.id}>
              <p className="tpl-display text-[1.6rem] leading-snug text-[color:var(--navy)]">{t(e.venue_name, locale)}</p>
              {t(e.venue_address, locale) && (
                <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-[color:var(--ink-soft)]">{t(e.venue_address, locale)}</p>
              )}
              {e.map_url && (
                <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="tpl-btn mt-7">
                  {s("directions", locale)}
                  <span className="sr-only"> {s("opensNewTab", locale)}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
