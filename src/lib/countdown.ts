export type CountdownState =
  | { phase: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { phase: "today" }
  | { phase: "after" };

/** How long the "today is the day" message stays up after the start time. */
const DAY_OF_MS = 12 * 60 * 60 * 1000;

/**
 * Splits the time until `targetMs` into days / hours / minutes / seconds.
 * Both values are UTC epoch milliseconds, so the wedding's timezone is already
 * baked into the target instant.
 */
export function countdown(targetMs: number, nowMs: number): CountdownState {
  const diff = targetMs - nowMs;
  if (diff <= 0) return -diff < DAY_OF_MS ? { phase: "today" } : { phase: "after" };

  const totalSeconds = Math.floor(diff / 1000);
  return {
    phase: "before",
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
