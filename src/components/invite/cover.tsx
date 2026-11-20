/*
 * Invitation cover, after page 1 of the printed card: corner labels around a
 * monogram, gold "THE WEDDING DAY" between double rules, a framed portrait,
 * the couple's names in foil, and date / time / venue in three columns.
 */
import Image from "next/image";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Invitation } from "@/lib/invitation";
import { t, type Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { formatShortDate, formatTimeRange, weddingYear } from "@/lib/i18n/datetime";
import { mediaUrl } from "@/lib/media";
import { DoubleRule, MonogramSeal } from "@/components/ornaments";
import { GoldCord } from "./sleeve-parts";

type Props = { invitation: Invitation; locale: Locale; monogram: string };

export function Cover({ invitation, locale, monogram }: Props) {
  const { wedding, events, photos } = invitation;
  const main = events.find((e) => e.kind === "ceremony") ?? events[0];
  const cover = photos.find((p) => p.is_cover) ?? photos[0];
  const tz = wedding.timezone;
  const year = main ? weddingYear(main.starts_at, tz) : null;
  const tagline = t(wedding.tagline, locale);

  return (
    <section aria-labelledby="cover-title" className="paper frame-double @container relative px-[clamp(1rem,5vw,1.75rem)] pt-10 pb-7 text-navy">
      <GoldCord className="absolute -top-[30px] left-1/2 h-[46px] w-[60px] -translate-x-1/2" />

      {/* Corner labels and monogram */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <Rule />
          <p className="corner-label py-1.5">
            Our
            <br />
            Special
            <br />
            Day
          </p>
          <Rule />
        </div>
        <div className="flex flex-col items-center px-1">
          <MonogramSeal monogram={monogram} className="size-[64px] text-[1.65rem]" />
        </div>
        <div className="text-right">
          <Rule />
          <p className="corner-label py-1.5">
            Our
            <br />
            Love Story
            <br />
            {year ? `Est. ${year}` : " "}
          </p>
          <Rule />
        </div>
      </header>
      <p className="font-display mt-2 text-center text-[1.05rem] text-ink-soft italic">
        <span aria-hidden className="mr-2 inline-block h-px w-6 bg-current align-middle opacity-60" />
        Together Forever
        <span aria-hidden className="ml-2 inline-block h-px w-6 bg-current align-middle opacity-60" />
      </p>

      {/* Title */}
      <DoubleRule className="mt-4" />
      <h1
        id="cover-title"
        className="foil font-display my-1.5 text-center text-[clamp(1.3rem,9.6cqi,2.5rem)] leading-none font-bold tracking-[0.01em] whitespace-nowrap"
      >
        {s("theWeddingDay", locale)}
      </h1>
      <DoubleRule />
      {tagline && (
        <p lang={locale} className="cover-tagline mt-2 text-center">
          {tagline}
        </p>
      )}
      <DoubleRule className="mt-2" />

      {/* Portrait */}
      {cover && (
        <figure className="mt-5 border border-navy/70 p-[3px]">
          <Image
            src={mediaUrl(cover.storage_path)}
            alt={t(cover.alt, locale)}
            width={cover.width}
            height={cover.height}
            sizes="(max-width: 430px) 88vw, 380px"
            quality={85}
            loading="eager"
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </figure>
      )}

      {/* Names */}
      <div lang={locale} className="mt-5 text-center">
        <p className="cover-name foil">{t(wedding.partner_one_name, locale)}</p>
        <div className="my-0.5 flex items-center gap-3">
          <span className="h-px flex-1 bg-navy/60" />
          <span className="font-display text-xl text-gold italic [&:lang(my)]:text-base [&:lang(my)]:not-italic">
            {s("and", locale)}
          </span>
          <span className="h-px flex-1 bg-navy/60" />
        </div>
        <p className="cover-name foil">{t(wedding.partner_two_name, locale)}</p>
      </div>

      {/* Date / time / venue */}
      {main && (
        <div className="mt-5">
          <DoubleRule />
          <dl lang={locale} className="grid grid-cols-[1fr_1px_1fr_1px_1.15fr] items-start gap-x-2 py-3 text-center">
            <InfoCell icon={<CalendarDays />} label={locale === "my" ? "နေ့ရက်" : "Date"}>
              {formatShortDate(main.starts_at, tz, locale)}
            </InfoCell>
            <span aria-hidden className="h-full bg-navy/50" />
            <InfoCell icon={<Clock />} label={locale === "my" ? "အချိန်" : "Time"}>
              {formatTimeRange(main.starts_at, main.ends_at, tz, locale)}
            </InfoCell>
            <span aria-hidden className="h-full bg-navy/50" />
            <InfoCell icon={<MapPin />} label={locale === "my" ? "နေရာ" : "Venue"}>
              <span className="block">{t(main.venue_name, locale)}</span>
              <span className="block text-[0.85em] text-ink-soft">{t(main.venue_address, locale)}</span>
            </InfoCell>
          </dl>
          <DoubleRule />
        </div>
      )}

      {/* Footer brand line */}
      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-navy/50" />
        <p className="label-caps text-[0.55rem] text-ink-soft" lang="en">
          The Day {year ? `· ${year}` : ""}
        </p>
        <span className="h-px flex-1 bg-navy/50" />
      </div>
    </section>
  );
}

function Rule() {
  return <span aria-hidden className="block h-px bg-navy/60" />;
}

function InfoCell({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <span aria-hidden className="text-navy [&>svg]:size-[18px] [&>svg]:stroke-[1.4]">
        {icon}
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="cover-info mt-1.5">{children}</dd>
    </div>
  );
}
