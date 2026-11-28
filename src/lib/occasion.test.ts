import { describe, expect, it } from "vitest";
import { ageOf, birthdayLine, invitationTitle, occasionOf } from "./occasion";
import { templateFor, templatesFor } from "./templates";

const birthday = { partner_one_name: { en: "Sacha", my: "ဆာချာ" }, partner_two_name: {}, cover_text: { occasion: "birthday", age: { en: "1st", my: "ပထမ" } } };
const wedding = { partner_one_name: { en: "Thiha" }, partner_two_name: { en: "Yadanar" }, cover_text: {} };

describe("occasions", () => {
  it("reads the occasion and age from cover_text", () => {
    expect(occasionOf(birthday.cover_text)).toBe("birthday");
    expect(occasionOf(null)).toBe("wedding");
    expect(ageOf(birthday.cover_text, "my")).toBe("ပထမ");
    expect(ageOf({}, "en")).toBe("");
  });
  it("titles a birthday and a wedding", () => {
    expect(invitationTitle(birthday, "en")).toBe("Sacha’s 1st Birthday");
    expect(invitationTitle(birthday, "my")).toBe("ဆာချာ ၏ ပထမ မွေးနေ့");
    expect(invitationTitle({ ...birthday, partner_one_name: { en: "James" }, cover_text: { occasion: "birthday" } }, "en")).toBe("James’ Birthday");
    expect(invitationTitle(wedding, "en")).toBe("Thiha & Yadanar");
    expect(birthdayLine("", "my")).toBe("မွေးနေ့");
  });
  it("keeps birthdays and weddings on their own designs", () => {
    expect(templatesFor("birthday").map((t) => t.key)).toEqual(["bloom"]);
    expect(templatesFor("wedding").some((t) => t.key === "bloom")).toBe(false);
    expect(templateFor("letters", "birthday")).toBe("bloom");
    expect(templateFor("bloom", "wedding")).toBe("classic");
    expect(templateFor("letters", "wedding")).toBe("letters");
  });
});
