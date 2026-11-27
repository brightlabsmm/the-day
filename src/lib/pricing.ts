/**
 * Invitation levels and prices, shared by the pricing page and the landing page so the
 * "from" price on the landing page always matches the plans. Prices are in Myanmar kyat (MMK).
 */
export type Level = {
  id: 1 | 2 | 3;
  name: string;
  forWho: string;
  price: number;
  discount: number;
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
    price: 300_000,
    discount: 30,
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
    price: 450_000,
    discount: 30,
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
    price: 700_000,
    discount: 50,
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
/** Price after the launch discount. */
export const finalPrice = (l: Level) => Math.round((l.price * (100 - l.discount)) / 100);
/** The lowest price a customer can pay today (after discounts), for "from ..." lines. */
export const startingPrice = () => Math.min(...LEVELS.map(finalPrice));
