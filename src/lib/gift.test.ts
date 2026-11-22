import { describe, expect, it } from "vitest";
import { parseGiftCampaign, parseUnlocked } from "./gift";
import { intentionsFromForm, intentionsToText, normaliseCode } from "./admin/gift-forms";
import { DEMO_GIFT_CAMPAIGN } from "./gift-demo";

const item = (position: number, title: Record<string, string>, extra: Record<string, unknown> = {}) => ({
  position,
  icon: "gem",
  kind: "voucher",
  category: {},
  title,
  description: {},
  detail_title: {},
  detail_text: {},
  code: null,
  ...extra,
});

const raw = (items: unknown[]) => ({
  campaign: { ...DEMO_GIFT_CAMPAIGN.campaign },
  items,
});

describe("gift campaigns", () => {
  it("parses the demo campaign as-is", () => {
    const parsed = parseGiftCampaign(DEMO_GIFT_CAMPAIGN);
    expect(parsed?.items).toHaveLength(12);
    expect(parsed?.items.map((i) => i.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("returns null for a missing campaign", () => {
    expect(parseGiftCampaign(null)).toBeNull();
  });

  it("drops empty slots, sorts by position and repairs unknown icons and kinds", () => {
    const parsed = parseGiftCampaign(raw([item(3, { en: "C" }), item(1, {}), item(2, { my: "ခ" }, { icon: "unicorn", kind: "lottery" })]));
    expect(parsed?.items.map((i) => i.position)).toEqual([2, 3]);
    expect(parsed?.items[0].icon).toBe("star");
    expect(parsed?.items[0].kind).toBe("voucher");
  });

  it("reads only valid, known unlocked positions from storage", () => {
    expect(parseUnlocked(null, [1, 2])).toEqual([]);
    expect(parseUnlocked("not json", [1, 2])).toEqual([]);
    expect(parseUnlocked('{"a":1}', [1, 2])).toEqual([]);
    expect(parseUnlocked("[3, 1, 1, 99, \"2\"]", [1, 2, 3])).toEqual([1, 3]);
  });
});

describe("gift admin forms", () => {
  it("pairs sign-up choices by line and drops blank pairs", () => {
    const form = new FormData();
    form.set("intentions_my", "က\n\nဂ");
    form.set("intentions_en", "A\n\nC\nD");
    expect(intentionsFromForm(form)).toEqual([{ my: "က", en: "A" }, { my: "ဂ", en: "C" }, { en: "D" }]);
  });

  it("round-trips choices to textarea text", () => {
    const list = [{ my: "က", en: "A" }, { en: "B" }];
    expect(intentionsToText(list, "en")).toBe("A\nB");
    expect(intentionsToText(list, "my")).toBe("က\n");
    expect(intentionsToText("nope", "en")).toBe("");
  });

  it("normalises codes and rejects invalid ones", () => {
    expect(normaliseCode(" peace528 ")).toBe("PEACE528");
    expect(normaliseCode("")).toBeNull();
    expect(normaliseCode("BAD CODE")).toBeUndefined();
    expect(normaliseCode("X".repeat(41))).toBeUndefined();
  });
});
