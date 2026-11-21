import { describe, expect, it } from "vitest";
import { colorsToText, dressCodeFromForm, faqFromForm, faqToText, parseBlocks, storyFromForm, tipsFromForm, tipsToText } from "./forms";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("list content from text boxes", () => {
  it("splits blocks on blank lines", () => {
    expect(parseBlocks("a\nb\n\n\n c \n")).toEqual([["a", "b"], ["c"]]);
    expect(parseBlocks("  \n ")).toEqual([]);
  });
  it("builds FAQ items from two languages by position", () => {
    const items = faqFromForm(form({ faq_en: "Parking?\nYes, free.\n\nPlus one?\nSee invite.", faq_my: "ကားရပ်ရန်?\nရပါသည်။" }));
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ q: { en: "Parking?", my: "ကားရပ်ရန်?" }, a: { en: "Yes, free.", my: "ရပါသည်။" } });
    expect(items[1].q).toEqual({ en: "Plus one?" });
  });
  it("round-trips FAQ text", () => {
    const text = "Q1\nA1\n\nQ2\nA2 line 1\nA2 line 2";
    const items = faqFromForm(form({ faq_en: text }));
    expect(faqToText(items, "en")).toBe(text);
  });
  it("builds good-to-know tips from two languages and round-trips them", () => {
    const text = "Parking\nFree on site.\n\nWeather";
    const tips = tipsFromForm(form({ tips_en: text, tips_my: "ကားရပ်ရန်\nအခမဲ့" }));
    expect(tips).toHaveLength(2);
    expect(tips[0]).toEqual({ title: { en: "Parking", my: "ကားရပ်ရန်" }, text: { en: "Free on site.", my: "အခမဲ့" } });
    expect(tips[1]).toEqual({ title: { en: "Weather" }, text: {} });
    expect(tipsToText(tipsFromForm(form({ tips_en: text })), "en")).toBe(text);
  });
  it("builds a story with label, title and text", () => {
    const [it] = storyFromForm(form({ story_en: "WINTER 2020\nThe First Hello\nA quiet evening.\nSecond line." }));
    expect(it.label).toEqual({ en: "WINTER 2020" });
    expect(it.title).toEqual({ en: "The First Hello" });
    expect(it.text).toEqual({ en: "A quiet evening.\nSecond line." });
  });
  it("reads colours, ignoring lines without a valid hex", () => {
    const d = dressCodeFromForm(form({ colors_en: "#5E1A27 Burgundy\nnot a colour\n#fff Short", colors_my: "#5e1a27 ဘာဂန်ဒီ", dress_text_en: "Formal" }));
    expect(d.colors).toEqual([{ hex: "#5e1a27", name: { en: "Burgundy", my: "ဘာဂန်ဒီ" } }]);
    expect(d.text).toEqual({ en: "Formal" });
    expect(colorsToText(d.colors, "en")).toBe("#5e1a27 Burgundy");
  });
});
