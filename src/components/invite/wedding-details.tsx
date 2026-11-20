/*
 * Wedding programme, after page 4 of the printed card: for each event, the
 * date, time and venue, each under a label framed by a pair of hairline icons.
 * Then a Google Maps link and the couple's note in a dashed box.
 */
import type { ReactNode } from "react";
import { CalendarDays, Clock, MapPin, Navigation } from "lucide-react";
import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { formatLongDate, formatTimeRange } from "@/lib/i18n/datetime";
import { Flourish } from "@/components/ornaments";
import { InnerCard } from "./inner-card";

export function WeddingDetails({ invitation, locale }: { invitation: Invitation; locale: Locale }) {
  const { wedding, events } = invitation;
  const note = t(wedding.note, locale);
  const many = events.length > 1;

  return (
    <InnerCard id="programme-heading" heading={s("programmeHeading", locale)} lang={locale}>
      {events.map((event, i) => {
        const venue = t(event.venue_name, locale);
        const address = t(event.venue_address, locale);
        // No cross-language fallback: a Myanmar-calendar date only shows where it was written.
        const myanmarDate = event.myanmar_date_text[locale] ?? "";
        return (
          <article key={event.id} aria-label={t(event.title, locale) || undefined}>
            {many && (
              <>
                {i > 0 && <Flourish className="mx-auto mt-8 text-navy/60" />}
                <h3 className="card-subheading mt-6">{t(event.title, locale)}</h3>
              </>
            )}

            <DetailRow icon={<CalendarDays />} label={s("dateLabel", locale)}>
              {myanmarDate && <span className="block">{myanmarDate}</span>}
              <span className="block">{formatLongDate(event.starts_at, wedding.timezone, locale)}</span>
            </DetailRow>

            <DetailRow icon={<Clock />} label={s("timeLabel", locale)}>
              {formatTimeRange(event.starts_at, event.ends_at, wedding.timezone, locale)}
            </DetailRow>

            <DetailRow icon={<MapPin />} label={s("venueLabel", locale)}>
              {venue && <span className="card-venue block">{venue}</span>}
              {address && <span className="mt-1 block">{address}</span>}
            </DetailRow>

            {event.map_url && (
              <a
                href={event.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button mt-5"
              >
                <Navigation aria-hidden className="size-4 stroke-[1.5]" />
                <span>{s("openMap", locale)}</span>
                <span className="sr-only">{s("opensNewTab", locale)}</span>
              </a>
            )}
          </article>
        );
      })}

      {note && (
        <p className="card-body mt-9 border border-dashed border-navy/55 px-4 py-3 whitespace-pre-line text-ink">
          {note}
        </p>
      )}
    </InnerCard>
  );
}

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-center gap-[clamp(1.25rem,10cqi,3rem)]">
        <span aria-hidden className="card-icon">{icon}</span>
        <p className="card-label">{label}</p>
        <span aria-hidden className="card-icon">{icon}</span>
      </div>
      <p className="card-body mt-2">{children}</p>
    </div>
  );
}
