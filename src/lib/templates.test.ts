import { describe, expect, it } from "vitest";
import { TEMPLATES, templateKey } from "./templates";
import { taglineWords } from "@/components/templates/view";

describe("page designs", () => {
  it("accepts known keys and falls back to classic", () => {
    for (const t of TEMPLATES) expect(templateKey(t.key)).toBe(t.key);
    expect(templateKey("nope")).toBe("classic");
    expect(templateKey(null)).toBe("classic");
    expect(templateKey(undefined)).toBe("classic");
  });
  it("splits a tagline into at most three display words", () => {
    expect(taglineWords("Two Hearts / One Journey / Forever")).toEqual(["Two Hearts", "One Journey", "Forever"]);
    expect(taglineWords("နှလုံးသားနှစ်ခု၊ ခရီးတစ်ခု၊ ထာဝရ")).toHaveLength(3);
    expect(taglineWords("a, b, c, d")).toHaveLength(3);
    expect(taglineWords("")).toEqual([]);
  });
});
