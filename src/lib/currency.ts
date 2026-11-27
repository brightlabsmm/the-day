import "server-only";
import { cookies, headers } from "next/headers";
import { CURRENCY_COOKIE, isCurrency, type Currency } from "@/lib/pricing";

/**
 * Which currency to show this visitor: their own choice from the switch if they made one,
 * otherwise from their country (Vercel sends it as `x-vercel-ip-country`). Myanmar sees kyat;
 * Taiwan, Thailand and everywhere else see US dollars. With no country (local development), kyat.
 *
 * Reads request data, so call it only inside a <Suspense> boundary (Cache Components).
 */
export async function visitorCurrency(): Promise<Currency> {
  const chosen = (await cookies()).get(CURRENCY_COOKIE)?.value;
  if (isCurrency(chosen)) return chosen;
  const country = (await headers()).get("x-vercel-ip-country");
  if (!country) return "MMK";
  return country.toUpperCase() === "MM" ? "MMK" : "USD";
}
