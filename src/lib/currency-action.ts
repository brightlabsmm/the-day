"use server";

import { cookies } from "next/headers";
import { CURRENCY_COOKIE, isCurrency } from "@/lib/pricing";

/** Remembers which prices a visitor wants to see (for a year). */
export async function setCurrency(currency: string): Promise<void> {
  if (!isCurrency(currency)) return;
  (await cookies()).set(CURRENCY_COOKIE, currency, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
