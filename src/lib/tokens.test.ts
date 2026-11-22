import { describe, expect, it } from "vitest";
import { generateGuestToken, generateWeddingCode, slugify } from "./tokens";

const TOKEN_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("guest tokens", () => {
  it("is a readable name plus 8 unambiguous characters", () => {
    const token = generateGuestToken("Ko Aung");
    expect(token).toMatch(/^ko-aung-[2-9a-hjkmnp-z]{8}$/);
    expect(token).toMatch(TOKEN_RE);
    expect(token.length).toBeLessThanOrEqual(64);
  });
  it("falls back to 'guest' for names with no latin letters", () => {
    expect(generateGuestToken("ကိုအောင်")).toMatch(/^guest-[a-z0-9]{8}$/);
  });
  it("does not repeat", () => {
    const set = new Set(Array.from({ length: 500 }, () => generateGuestToken("Ma Su")));
    expect(set.size).toBe(500);
  });
  it("slugify strips accents and symbols and caps length", () => {
    expect(slugify("  Zoë & Co.  ")).toBe("zoe-co");
    expect(slugify("a".repeat(100)).length).toBe(40);
  });
});

describe("wedding codes", () => {
  it("is 12 unambiguous characters that pass the slug rule", () => {
    const code = generateWeddingCode();
    expect(code).toMatch(/^[2-9a-hjkmnp-z]{12}$/);
    expect(code).toMatch(TOKEN_RE);
  });
  it("does not repeat", () => {
    const set = new Set(Array.from({ length: 2000 }, () => generateWeddingCode()));
    expect(set.size).toBe(2000);
  });
});
