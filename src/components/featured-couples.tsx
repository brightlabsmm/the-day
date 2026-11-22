import Image from "next/image";
import { cacheLife } from "next/cache";
import { ArrowUpRight, CalendarHeart, MapPin } from "lucide-react";
import { getInvitation } from "@/lib/invitation";
import { mediaUrl } from "@/lib/media";
import { formatLongDate } from "@/lib/i18n/datetime";
import { t } from "@/lib/i18n/numerals";
import { themeOf } from "@/lib/theme";

/**
 * Real couples shown on the home page. Only list couples who have agreed to
 * be featured. Everything else (names, photo, date, venue, extras) is read
 * from their live invitation, so it stays in sync.
 */
const FEATURED: { slug: string; design: string; story: string }[] = [
  {
    slug: "g4tc58rfan5e",
    design: "Envelope",
    story:
      "Two civil engineers building a life together. Their invitation opens from a cream envelope sealed with their K&T monogram, onto a page where snow drifts down as guests scroll.",
  },
];

type Couple = {
  slug: string;
  design: string;
  story: string;
  names: [string, string];
  monogram: string;
  cover: { src: string; alt: string; width: number; height: number } | null;
  date: string;
  venue: string;
  extras: string[];
};

async function loadCouples(): Promise<Couple[]> {
  "use cache";
  cacheLife("hours");
  const couples = await Promise.all(
    FEATURED.map(async (f): Promise<Couple | null> => {
      try {
        const inv = await getInvitation(f.slug, undefined);
        if (!inv) return null;
        const { wedding, events, photos } = inv;
        const main = events.find((e) => e.kind === "ceremony") ?? events[0];
        const cover = photos.find((p) => p.is_cover) ?? photos[0];
        const one = t(wedding.partner_one_name, "en");
        const two = t(wedding.partner_two_name, "en");
        const theme = themeOf(inv);
        const extras = [
          "Burmese & English",
          ...(theme.snow ? ["Falling snow"] : []),
          ...(wedding.music_path ? ["Their wedding song"] : []),
          ...(wedding.gift_methods.length ? ["Gift QR codes"] : []),
          ...(wedding.wishes_enabled ? ["Wishes wall"] : []),
        ];
        return {
          slug: f.slug,
          design: f.design,
          story: f.story,
          names: [one, two],
          monogram: wedding.monogram ?? `${one.charAt(0)}&${two.charAt(0)}`,
          cover: cover
            ? { src: mediaUrl(cover.storage_path), alt: t(cover.alt, "en") || `${one} and ${two}`, width: cover.width, height: cover.height }
            : null,
          date: main ? formatLongDate(main.starts_at, wedding.timezone, "en") : "",
          venue: main ? t(main.venue_name, "en") : "",
          extras,
        };
      } catch {
        return null;
      }
    }),
  );
  return couples.filter((c): c is Couple => c !== null);
}

/** "Love stories we've told": real invitations, each with its photo and a live phone preview. */
export async function FeaturedCouples() {
  const couples = await loadCouples();
  if (couples.length === 0) return null;

  return (
    <section id="couples" aria-labelledby="couples-heading" className="scroll-mt-6 border-y border-[#2f2925]/10 bg-[#fbf8f2] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="text-center">
          <p className="caps text-[#8a7766]">Real couples</p>
          <h2 id="couples-heading" className="font-display mt-3 text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight text-[#1f1b18]">
            Love stories we’ve <span className="script text-[1.2em] text-[#a8823f]">told</span>
          </h2>
          <span className="mx-auto mt-4 block h-px w-16 bg-[#a8823f]" aria-hidden />
          <p className="mx-auto mt-4 max-w-lg text-[1.05rem] text-[#5c5048]">
            Every invitation is made for one couple. Here are a few we’ve had the joy of creating.
          </p>
        </div>

        <ul className="mt-12 space-y-16 sm:mt-16 sm:space-y-24">
          {couples.map((c, i) => (
            <li key={c.slug}>
              <CoupleFeature couple={c} flip={i % 2 === 1} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CoupleFeature({ couple: c, flip }: { couple: Couple; flip: boolean }) {
  return (
    <article aria-labelledby={`couple-${c.slug}`} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Photo, wax seal and a live preview of their invitation */}
      <div className={`relative mx-auto w-full max-w-md ${flip ? "lg:order-2" : ""}`}>
        <div className="paper frame-double p-3 shadow-[0_30px_60px_-34px_rgba(74,52,38,.7)] sm:p-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e9dfcf]">
            {c.cover && (
              <Image src={c.cover.src} alt={c.cover.alt} fill sizes="(max-width: 1024px) 90vw, 448px" className="object-cover" />
            )}
          </div>
        </div>
        <span
          className="seal seal-mark font-display absolute -top-5 left-1 grid size-16 place-items-center rounded-full text-lg font-semibold tracking-wide sm:-left-5 sm:size-20 sm:text-xl"
          aria-hidden
        >
          {c.monogram}
        </span>
        <div className="absolute -right-6 -bottom-10 hidden rounded-[1.9rem] border-[7px] border-[#1f1b18] bg-[#1f1b18] shadow-[0_30px_50px_-24px_rgba(47,41,37,.8)] md:block lg:-right-14">
          <div className="relative h-[388px] w-[179px] overflow-hidden rounded-[1.45rem] bg-white">
            <iframe
              title={`${c.names[0]} and ${c.names[1]}'s invitation, preview`}
              src={`/w/${c.slug}?lang=en&preview=1`}
              loading="lazy"
              tabIndex={-1}
              className="pointer-events-none absolute top-0 left-0 h-[844px] w-[390px] origin-top-left scale-[0.46] border-0"
            />
          </div>
        </div>
      </div>

      {/* Their story */}
      <div className="text-center lg:text-left">
        <p className="caps text-[#8a7766]">{c.design} design</p>
        <h3 id={`couple-${c.slug}`} className="script mt-3 text-[clamp(2.6rem,7vw,3.8rem)] leading-[1.05] text-[#1f1b18]">
          {c.names[0]}
          <br />
          <span className="mr-2 text-[#a8823f]">&amp;</span>
          {c.names[1]}
        </h3>

        <ul className="mt-5 flex flex-col items-center gap-2 text-[1.02rem] text-[#5c5048] sm:flex-row sm:justify-center sm:gap-6 lg:justify-start">
          {c.date && (
            <li className="inline-flex items-center gap-2">
              <CalendarHeart className="size-4 text-[#a8823f]" aria-hidden />
              {c.date}
            </li>
          )}
          {c.venue && (
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-[#a8823f]" aria-hidden />
              {c.venue}
            </li>
          )}
        </ul>

        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-[#2f2925] lg:mx-0">{c.story}</p>

        <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="In their invitation">
          {c.extras.map((x) => (
            <li key={x} className="rounded-full border border-[#a8823f]/35 bg-white/70 px-3 py-1 text-sm text-[#7f6129]">
              {x}
            </li>
          ))}
        </ul>

        <a
          href={`/w/${c.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2f2925] px-6 py-3.5 font-medium text-[#f6f1e7] shadow-[0_10px_24px_-12px_rgba(47,41,37,.7)] transition hover:bg-[#1f1b18]"
        >
          Open their invitation
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
    </article>
  );
}
