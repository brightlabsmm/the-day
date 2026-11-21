/**
 * Creates or updates a wedding (details, events, photos, gift QR codes) from a
 * folder containing wedding.json and the image files it refers to.
 *
 *   pnpm import:wedding private/kyaw-aye
 *
 * Uses SUPABASE_SECRET_KEY, so it writes to whatever NEXT_PUBLIC_SUPABASE_URL
 * points at (local by default). Run again to update: photos, events and gift
 * images are replaced; guests and wishes are left alone.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { localInputToIso } from "../src/lib/admin/forms";

const i18n = z.record(z.string(), z.string());
const Config = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  status: z.enum(["draft", "published"]).default("published"),
  timezone: z.string().default("Asia/Yangon"),
  template_key: z.enum(["classic", "editorial", "envelope", "scratch", "theatre", "record", "wildflower", "shutters"]).default("classic"),
  partner_one_name: i18n,
  partner_two_name: i18n,
  monogram: z.string().nullable().default(null),
  tagline: i18n.default({}),
  invitation_text: i18n.default({}),
  family: z.record(z.string(), z.unknown()).default({}),
  note: i18n.default({}),
  closing_quote: i18n.default({}),
  cover_text: z.record(z.string(), z.unknown()).default({}),
  wishes_enabled: z.boolean().default(true),
  wishes_editable: z.boolean().default(false),
  public_wishes: z.boolean().default(false),
  rsvp_enabled: z.boolean().default(false),
  dress_code: z.record(z.string(), z.unknown()).default({}),
  faq: z.array(z.record(z.string(), z.unknown())).default([]),
  story: z.array(z.record(z.string(), z.unknown())).default([]),
  events: z.array(
    z.object({
      kind: z.enum(["ceremony", "reception", "other"]),
      title: i18n,
      starts_at_local: z.string(),
      ends_at_local: z.string().optional(),
      myanmar_date_text: i18n.default({}),
      venue_name: i18n.default({}),
      venue_address: i18n.default({}),
      map_url: z.string().startsWith("https://").nullable().default(null),
    }),
  ),
  photos: z.array(
    z.object({
      file: z.string(),
      kind: z.enum(["portrait", "couple", "traditional", "spread"]),
      cover: z.boolean().default(false),
      alt: i18n.default({}),
    }),
  ),
  gifts: z.array(z.object({ label: z.string(), account_name: z.string().optional(), file: z.string() })).default([]),
  /** Background music: an mp3, m4a, aac or ogg file in the folder. */
  music: z.object({ file: z.string(), title: z.string().optional() }).optional(),
});

export async function importWedding(dir: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.local)");
  const cfg = Config.parse(JSON.parse(await readFile(path.join(dir, "wedding.json"), "utf8")));
  const db = createClient(url, key, { auth: { persistSession: false } });
  console.log(`Target: ${url}`);

  const { data: w, error } = await db
    .from("weddings")
    .upsert(
      {
        slug: cfg.slug,
        status: cfg.status,
        timezone: cfg.timezone,
        template_key: cfg.template_key,
        partner_one_name: cfg.partner_one_name,
        partner_two_name: cfg.partner_two_name,
        monogram: cfg.monogram,
        tagline: cfg.tagline,
        invitation_text: cfg.invitation_text,
        family: cfg.family as never,
        note: cfg.note,
        closing_quote: cfg.closing_quote,
        cover_text: cfg.cover_text as never,
        wishes_enabled: cfg.wishes_enabled,
        wishes_editable: cfg.wishes_editable,
        public_wishes: cfg.public_wishes,
        rsvp_enabled: cfg.rsvp_enabled,
        dress_code: cfg.dress_code as never,
        faq: cfg.faq as never,
        story: cfg.story as never,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw error;
  const id = w.id;
  console.log(`✓ wedding ${cfg.slug} (${id})`);

  // Events
  await db.from("wedding_events").delete().eq("wedding_id", id);
  for (const [i, e] of cfg.events.entries()) {
    const starts = localInputToIso(e.starts_at_local, cfg.timezone);
    const ends = e.ends_at_local ? localInputToIso(e.ends_at_local, cfg.timezone) : null;
    if (!starts || (e.ends_at_local && !ends)) throw new Error(`Bad date in event ${i + 1}`);
    const { error: evErr } = await db.from("wedding_events").insert({
      wedding_id: id,
      kind: e.kind,
      title: e.title,
      starts_at: starts,
      ends_at: ends,
      myanmar_date_text: e.myanmar_date_text,
      venue_name: e.venue_name,
      venue_address: e.venue_address,
      map_url: e.map_url,
      sort_order: i,
    });
    if (evErr) throw evErr;
  }
  console.log(`✓ ${cfg.events.length} event(s)`);

  // Replace stored media for this wedding
  await db.from("wedding_photos").delete().eq("wedding_id", id);
  for (const folder of ["photos", "gifts", "music"]) {
    const { data: old } = await db.storage.from("wedding-media").list(`${id}/${folder}`);
    if (old?.length) await db.storage.from("wedding-media").remove(old.map((o) => `${id}/${folder}/${o.name}`));
  }

  for (const [i, p] of cfg.photos.entries()) {
    const out = await sharp(await readFile(path.join(dir, p.file)))
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    const storagePath = `${id}/photos/${crypto.randomUUID()}.webp`;
    const { error: upErr } = await db.storage
      .from("wedding-media")
      .upload(storagePath, out.data, { contentType: "image/webp", cacheControl: "31536000" });
    if (upErr) throw upErr;
    const { error: insErr } = await db.from("wedding_photos").insert({
      wedding_id: id,
      storage_path: storagePath,
      width: out.info.width,
      height: out.info.height,
      kind: p.kind,
      alt: p.alt,
      is_cover: p.cover,
      sort_order: i,
    });
    if (insErr) throw insErr;
    console.log(`✓ photo ${p.file} (${out.info.width}×${out.info.height})`);
  }

  const gifts = [];
  for (const g of cfg.gifts) {
    const png = await sharp(await readFile(path.join(dir, g.file))).png().toBuffer();
    const qr_path = `${id}/gifts/${crypto.randomUUID()}.png`;
    const { error: upErr } = await db.storage
      .from("wedding-media")
      .upload(qr_path, png, { contentType: "image/png", cacheControl: "31536000" });
    if (upErr) throw upErr;
    gifts.push({ label: g.label, ...(g.account_name ? { account_name: g.account_name } : {}), qr_path });
    console.log(`✓ gift QR ${g.label}`);
  }
  let musicUpdate: { music_path: string | null; music_title: string | null } = { music_path: null, music_title: null };
  if (cfg.music) {
    const types: Record<string, [string, string]> = { ".mp3": ["audio/mpeg", "mp3"], ".m4a": ["audio/mp4", "m4a"], ".aac": ["audio/aac", "aac"], ".ogg": ["audio/ogg", "ogg"] };
    const [contentType, ext] = types[path.extname(cfg.music.file).toLowerCase()] ?? [];
    if (!contentType) throw new Error("music must be .mp3, .m4a, .aac or .ogg");
    const music_path = `${id}/music/${crypto.randomUUID()}.${ext}`;
    const { error: mErr } = await db.storage
      .from("wedding-media")
      .upload(music_path, await readFile(path.join(dir, cfg.music.file)), { contentType, cacheControl: "31536000" });
    if (mErr) throw mErr;
    musicUpdate = { music_path, music_title: cfg.music.title ?? null };
    console.log(`✓ music ${cfg.music.file}`);
  }
  const { error: gErr } = await db.from("weddings").update({ gift_methods: gifts, ...musicUpdate }).eq("id", id);
  if (gErr) throw gErr;
  console.log(`Done. Open /w/${cfg.slug}`);
}

// Run directly: pnpm import:wedding <folder>
if (process.argv[1]?.endsWith("import-wedding.ts")) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: pnpm import:wedding <folder>");
    process.exit(1);
  }
  importWedding(dir).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
