import { describe, expect, it } from "vitest";
import { i18nFromForm, isoToLocalInput, localInputToIso } from "./forms";

describe("timezone round trip", () => {
  it("Yangon is UTC+6:30", () => {
    expect(localInputToIso("2027-02-13T11:30", "Asia/Yangon")).toBe("2027-02-13T05:00:00.000Z");
  });
  it("respects daylight saving", () => {
    expect(localInputToIso("2027-07-04T09:00", "America/New_York")).toBe("2027-07-04T13:00:00.000Z");
    expect(localInputToIso("2027-01-04T09:00", "America/New_York")).toBe("2027-01-04T14:00:00.000Z");
  });
  it("round-trips and rejects bad input", () => {
    const iso = localInputToIso("2027-02-13T11:30", "Asia/Yangon")!;
    expect(isoToLocalInput(iso, "Asia/Yangon")).toBe("2027-02-13T11:30");
    expect(localInputToIso("nope", "Asia/Yangon")).toBeNull();
    expect(isoToLocalInput(null, "Asia/Yangon")).toBe("");
  });
});

describe("i18nFromForm", () => {
  it("keeps only non-empty languages, trimmed", () => {
    const f = new FormData();
    f.set("title_my", "  ");
    f.set("title_en", " Wedding ");
    expect(i18nFromForm(f, "title")).toEqual({ en: "Wedding" });
  });
});
