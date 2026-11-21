import { describe, expect, it } from "vitest";
import { formatNumber, t, toMyanmarDigits } from "./numerals";
import { resolveLocale } from "./locale";
import { formatLongDate, formatShortDate, formatTimeRange } from "./datetime";

describe("numerals and text", () => {
  it("converts digits and pads", () => {
    expect(toMyanmarDigits("2027-02-13")).toBe("၂၀၂၇-၀၂-၁၃");
    expect(formatNumber(7, "my", 2)).toBe("၀၇");
    expect(formatNumber(7, "en", 2)).toBe("07");
  });
  it("t() falls back to the other language", () => {
    expect(t({ en: "Hello" }, "my")).toBe("Hello");
    expect(t({ my: "မင်္ဂလာပါ", en: "Hello" }, "my")).toBe("မင်္ဂလာပါ");
    expect(t(null, "en")).toBe("");
  });
  it("locale: query beats cookie beats default Burmese", () => {
    expect(resolveLocale("en", "my")).toBe("en");
    expect(resolveLocale(undefined, "en")).toBe("en");
    expect(resolveLocale("fr", "xx")).toBe("my");
  });
});

describe("dates in the wedding timezone", () => {
  const iso = "2027-02-13T05:00:00Z"; // 11:30 in Yangon (UTC+6:30)
  it("formats English", () => {
    expect(formatShortDate(iso, "Asia/Yangon", "en")).toBe("Sat 13 FEB 2027");
    expect(formatLongDate(iso, "Asia/Yangon", "en")).toBe("Saturday, 13 February 2027");
    expect(formatTimeRange(iso, null, "Asia/Yangon", "en")).toBe("At 11:30 AM");
  });
  it("formats Burmese with Myanmar digits", () => {
    expect(formatShortDate(iso, "Asia/Yangon", "my")).toContain("၁၃-၂-၂၀၂၇");
  });
});
