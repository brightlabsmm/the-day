"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};
const thisYear = () => new Date().getFullYear();
/** Year shown in the prerendered HTML; the browser swaps in the real year right after loading. */
const PRERENDER_YEAR = 2026;

/**
 * The current year for the copyright line. It is read only in the browser (Next.js does not allow
 * `new Date()` while prerendering), so the line stays up to date without rebuilding the page.
 */
export function CurrentYear() {
  return <>{useSyncExternalStore(noSubscribe, thisYear, () => PRERENDER_YEAR)}</>;
}
