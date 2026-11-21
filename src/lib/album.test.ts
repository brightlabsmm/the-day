import { describe, expect, it } from "vitest";
import { albumRows, type AlbumPhoto } from "./album";

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
