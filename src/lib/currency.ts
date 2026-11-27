import "server-only";
import { headers } from "next/headers";
import type { Currency } from "@/lib/pricing";

/**
 * Which currency to show this visitor, from their country only (Vercel sends it as
 * `x-vercel-ip-country`): Myanmar sees kyat, every other country sees US dollars. There is no
 * switch, so visitors outside Myanmar cannot pick kyat. With no country (local development), kyat.
 *
 * Reads request data, so call it only inside a <Suspense> boundary (Cache Components).
 */
export async function visitorCurrency(): Promise<Currency> {
  const country = (await headers()).get("x-vercel-ip-country");
  if (!country) return "MMK";
  return country.toUpperCase() === "MM" ? "MMK" : "USD";
}
