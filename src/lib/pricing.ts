/**
 * Invitation levels and prices, shared by the pricing page and the landing page so the
 * "from" price on the landing page always matches the plans.
 *
 * Prices depend on where the customer is: Myanmar pays in kyat (MMK); Taiwan and Thailand pay in
 * US dollars. Each price is a usual price and a launch price; the "% off" is worked out from the two.
 */
export const CURRENCIES = ["MMK", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
/** Who each currency is for, as shown on the switch. */
export const CURRENCY_REGION: Record<Currency, string> = { MMK: "Myanmar", USD: "Taiwan & Thailand" };
/** Cookie that remembers a visitor's choice on the switch. */
export const CURRENCY_COOKIE = "theday_currency";
export const isCurrency = (v: unknown): v is Currency => typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);

export type Offer = { usual: number; launch: number };

export type Level = {
  id: 1 | 2 | 3;
  name: string;
  forWho: string;
  prices: Record<Currency, Offer>;
  rounds: number | "unlimited";
  badge?: string;
  featured?: boolean;
  intro: string;
  features: string[];
};

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Essential",
    forWho: "A beautiful invitation, with one link for all your guests.",
    prices: { MMK: { usual: 300_000, launch: 210_000 }, USD: { usual: 140, launch: 100 } },
    rounds: 3,
    intro: "What’s included",
    features: [
      "Your choice of 16 designs",
      "In Burmese and English",
      "A countdown and your schedule",
      "Up to 8 of your photos",
      "Gift QR codes",
      "A wishes wall for your guests",
      "One link to share with everyone",
      "3 rounds of changes",
    ],
  },
  {
    id: 2,
    name: "Signature",
    forWho: "A personal invitation that greets each guest by name.",
    prices: { MMK: { usual: 450_000, launch: 315_000 }, USD: { usual: 210, launch: 150 } },
    rounds: 5,
    badge: "Most popular",
    intro: "Everything in Essential, plus",
    features: [
      "A personal link for every guest",
      "See who has opened their invitation",
      "RSVP: guests reply in a tap",
      "Your story, dress code and FAQ",
      "Background music",
      "5 rounds of changes",
    ],
  },
  {
    id: 3,
    name: "Premium",
    forWho: "Every detail taken care of, for your big day.",
    prices: { MMK: { usual: 700_000, launch: 350_000 }, USD: { usual: 400, launch: 200 } },
    rounds: "unlimited",
    badge: "Best value",
    featured: true,
    intro: "Everything in Signature, plus",
    features: [
      "Your photos turned into an animated video",
      "Find your seat: guests look up their table",
      "Good to know: parking, transport and weather",
      "Your own words on the cover",
      "Priority setup",
      "Unlimited rounds of changes",
    ],
  },
];

export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
/** Launch discount in whole percent, from the usual and launch prices. */
export const discountOf = (o: Offer) => Math.round((1 - o.launch / o.usual) * 100);
/** The lowest price a customer can pay today in that currency, for "from ..." lines. */
export const startingPrice = (c: Currency) => Math.min(...LEVELS.map((l) => l.prices[c].launch));
