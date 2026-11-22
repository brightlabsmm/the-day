import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { oneTime } from "@/lib/i18n/datetime";
import { formatNumber } from "@/lib/i18n/numerals";
import { isHidden } from "@/lib/theme";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Events as a vertical timeline: time, title and venue. */
export function Schedule({
  invitation,
  locale,
  variant = "timeline",
}: {
  invitation: Invitation;
  locale: Locale;
  /** "acts" labels each event as Act I, II, III. */
  variant?: "timeline" | "acts" | "rows";
}) {
  const { events, wedding } = invitation;
  if (events.length === 0 || isHidden(invitation, "schedule")) return null;
  const tz = wedding.timezone;

  return (
    <section id="schedule" aria-labelledby="schedule-heading" lang={locale} className="tpl-section">
      <div className="tpl-narrow">
        <p className="tpl-eyebrow">{s("scheduleEyebrow", locale)}</p>
        <h2 id="schedule-heading" className="tpl-h2">
          {s("scheduleHeading", locale)}
        </h2>
        {variant === "rows" ? (
          <>
            <p className="mx-auto mt-3 max-w-md text-center text-[0.95rem] text-[color:var(--ink-soft)]">{s("scheduleTapHint", locale)}</p>
            <ul className="mt-10 divide-y divide-[color:var(--navy)]/15 border-y border-[color:var(--navy)]/15 text-left">
              {events.map((e) => {
                const venue = t(e.venue_name, locale);
                const address = t(e.venue_address, locale);
                return (
                  <li key={e.id}>
                    <details className="group">
                      <summary className="grid cursor-pointer list-none grid-cols-[6.5rem_1fr_auto] items-center gap-4 py-5">
                        <span className="tpl-display text-[1.05rem] text-[color:var(--ink-soft)] italic">{oneTime(e.starts_at, tz, locale)}</span>
                        <span className="tpl-display text-[1.2rem] text-[color:var(--navy)]">{t(e.title, locale)}</span>
                        <span aria-hidden className="text-[color:var(--gold)] transition-transform group-open:rotate-90">›</span>
                      </summary>
                      {(venue || address || e.map_url) && (
                        <div className="pb-5 pl-[7.5rem] text-[0.92rem] leading-relaxed text-[color:var(--ink-soft)]">
                          {venue && <p>{venue}</p>}
                          {address && <p className="whitespace-pre-line">{address}</p>}
                          {e.map_url && (
                            <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">
                              {s("directions", locale)}
                              <span className="sr-only"> {s("opensNewTab", locale)}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </details>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
        {variant === "acts" ? (
          <>
            <p className="mt-3 text-center text-[0.95rem] text-[color:var(--ink-soft)]">{s("scheduleActs", locale)}</p>
            <ol className="mt-10 divide-y divide-[color:var(--navy)]/15 border-y border-[color:var(--navy)]/15">
              {events.map((e, i) => (
                <li key={e.id} className="grid grid-cols-[4.6rem_auto_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[6rem_auto_1fr_auto] sm:gap-x-6">
                  <span className="tpl-eyebrow !text-left !text-[color:var(--gold-deep)]">
                    {s("act", locale)} {locale === "my" ? formatNumber(i + 1, locale) : (ROMAN[i] ?? i + 1)}
                  </span>
                  <span aria-hidden className="size-2.5 rounded-full bg-[color:var(--gold)]" />
                  <h3 className="tpl-display text-[1.25rem] leading-snug font-bold text-[color:var(--ink)]">{t(e.title, locale)}</h3>
                  <span className="tpl-display text-[1rem] text-[color:var(--navy)]">{oneTime(e.starts_at, tz, locale)}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
        <ol className={`tpl-timeline mt-12 ${variant === "acts" || variant === "rows" ? "hidden" : ""}`}>
          {events.map((e) => {
            const start = oneTime(e.starts_at, tz, locale);
            const end = e.ends_at ? oneTime(e.ends_at, tz, locale) : null;
            const venue = t(e.venue_name, locale);
            return (
              <li key={e.id}>
                <p className={`tpl-display text-right leading-snug text-[color:var(--ink-soft)] ${locale === "my" ? "text-[0.9rem]" : "text-[1.05rem]"}`}>
                  {start}
                  {end && (
                    <>
                      <br />
                      <span className="text-[0.85em] opacity-70">– {end}</span>
                    </>
                  )}
                </p>
                <span aria-hidden className="tpl-rail" />
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <h3 className={`tpl-display inline leading-snug text-[color:var(--navy)] ${locale === "my" ? "text-[1.05rem]" : "text-[1.35rem]"}`}>{t(e.title, locale)}</h3>
                    <span aria-hidden className="ml-2 inline-block text-[color:var(--gold)] transition-transform group-open:rotate-45">+</span>
                    {venue && <p className="mt-1 text-[0.95rem] text-[color:var(--ink-soft)]">{venue}</p>}
                  </summary>
                  {(t(e.venue_address, locale) || e.map_url) && (
                    <div className="mt-3 text-[0.9rem] leading-relaxed text-[color:var(--ink-soft)]">
                      {t(e.venue_address, locale) && <p className="whitespace-pre-line">{t(e.venue_address, locale)}</p>}
                      {e.map_url && (
                        <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">
                          {s("directions", locale)}
                          <span className="sr-only"> {s("opensNewTab", locale)}</span>
                        </a>
                      )}
                    </div>
                  )}
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
