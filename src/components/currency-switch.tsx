"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CURRENCIES, CURRENCY_REGION, type Currency } from "@/lib/pricing";
import { setCurrency } from "@/lib/currency-action";

/**
 * Lets a visitor pick which prices to see (Myanmar in MMK, or Taiwan & Thailand in USD).
 * The choice is saved in a cookie for a year (by a server action) and the page's prices refresh in place.
 */
export function CurrencySwitch({ current, className = "" }: { current: Currency; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (c: Currency) => {
    if (c === current) return;
    startTransition(async () => {
      await setCurrency(c);
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label="Show prices for"
      className={`inline-flex items-center rounded-full border border-[#b8913f]/45 bg-white/60 p-0.5 text-[0.8rem] ${pending ? "opacity-60" : ""} ${className}`}
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={c === current}
          onClick={() => choose(c)}
          className="rounded-full px-3 py-1 whitespace-nowrap text-[#5c524b] transition-colors hover:text-[#2f2925] aria-pressed:bg-[#8a6d33] aria-pressed:text-white"
        >
          {CURRENCY_REGION[c]} · {c}
        </button>
      ))}
    </div>
  );
}
