import { describe, expect, it } from "vitest";
import { albumRows, togetherPhotos, type AlbumPhoto } from "./album";

const photo = (id: string, w: number, h: number, kind: AlbumPhoto["kind"] = "couple"): AlbumPhoto => ({
  id, src: id, width: w, height: h, alt: "", kind,
});

describe("albumRows", () => {
  it("pairs consecutive portraits and keeps landscape photos on their own row", () => {
    const rows = albumRows([photo("a", 100, 150), photo("b", 100, 150), photo("c", 150, 100), photo("d", 100, 150)]);
    expect(rows.map((r) => r.type)).toEqual(["pair", "single", "single"]);
  });
  it("never pairs spreads", () => {
    const rows = albumRows([photo("a", 100, 150, "spread"), photo("b", 100, 150)]);
    expect(rows.map((r) => r.type)).toEqual(["single", "single"]);
  });
});

describe("togetherPhotos", () => {
  it("keeps couple, traditional and spread photos and drops portraits", () => {
    const kept = togetherPhotos([
      photo("a", 100, 80, "couple"),
      photo("b", 80, 100, "portrait"),
      photo("c", 100, 80, "traditional"),
      photo("d", 160, 90, "spread"),
    ]);
    expect(kept.map((p) => p.id)).toEqual(["a", "c", "d"]);
  });
});
