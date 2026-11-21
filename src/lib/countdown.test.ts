import { describe, expect, it } from "vitest";
import { countdown } from "./countdown";

const target = Date.parse("2027-02-13T05:00:00Z");

describe("countdown", () => {
  it("splits the remaining time", () => {
    const now = target - ((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
    expect(countdown(target, now)).toEqual({ phase: "before", days: 2, hours: 3, minutes: 4, seconds: 5 });
  });
  it("is 'today' from the start time for 12 hours, then 'after'", () => {
    expect(countdown(target, target).phase).toBe("today");
    expect(countdown(target, target + 11 * 3600_000).phase).toBe("today");
    expect(countdown(target, target + 12 * 3600_000).phase).toBe("after");
  });
});
