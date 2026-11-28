"use server";

import { z } from "zod";
import { i18nFromForm } from "../forms";
import { formFile, processImage, readAudio } from "../uploads";
import { fail, Id, ok, type ActionResult } from "../schemas";
import { dbFail, refreshWedding, weddingFromForm } from "./context";

const BUCKET = "wedding-media";
const MAX_PHOTOS = 8;
const YEAR = "31536000";

// ── Photos ──────────────────────────────────────────────────────

export async function uploadPhoto(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const file = formFile(form, "file");
  if (!file) return fail("Choose an image under 15 MB.");
  const kind = z.enum(["portrait", "couple", "traditional", "spread"]).safeParse(form.get("kind"));
  if (!kind.success) return fail("Choose a layout type.");

  const { data: existing } = await supabase.from("wedding_photos").select("sort_order, is_cover").eq("wedding_id", wedding.id);
  if ((existing?.length ?? 0) >= MAX_PHOTOS) return fail(`A wedding can have at most ${MAX_PHOTOS} photos.`);

  const img = await processImage(file, 2400, "webp");
  if (!img) return fail("That file could not be read as an image.");

  const path = `${wedding.id}/photos/${crypto.randomUUID()}.webp`;
  const up = await supabase.storage.from(BUCKET).upload(path, img.buffer, { contentType: img.contentType, cacheControl: YEAR });
  if (up.error) return dbFail(up.error, "upload the photo");

  const { error } = await supabase.from("wedding_photos").insert({
    wedding_id: wedding.id,
    storage_path: path,
    width: img.width,
    height: img.height,
    kind: kind.data,
    alt: i18nFromForm(form, "alt"),
    is_cover: !existing?.some((p) => p.is_cover),
    sort_order: Math.max(-1, ...(existing ?? []).map((p) => p.sort_order)) + 1,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return dbFail(error, "save the photo");
  }
  refreshWedding();
  return ok("Photo added");
}

/** Makes one photo the cover. Only one photo can be the cover, so the old one is cleared first. */
export async function setCover(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown photo.");
  const { data: old } = await supabase.from("wedding_photos").select("id").eq("wedding_id", wedding.id).eq("is_cover", true).maybeSingle();
  const cleared = await supabase.from("wedding_photos").update({ is_cover: false }).eq("wedding_id", wedding.id);
  if (cleared.error) return dbFail(cleared.error);
  const { error } = await supabase.from("wedding_photos").update({ is_cover: true }).eq("id", id.data).eq("wedding_id", wedding.id);
  if (error) {
    // Put the old cover back rather than leave the wedding without one.
    if (old) await supabase.from("wedding_photos").update({ is_cover: true }).eq("id", old.id);
    return dbFail(error);
  }
  refreshWedding();
  return ok("Cover changed");
}

/** Moves a photo one place up or down. Only the rows whose place changes are written. */
export async function movePhoto(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const id = Id.safeParse(form.get("id"));
  const dir = form.get("dir") === "up" ? -1 : 1;
  if (!id.success) return fail("Unknown photo.");
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("id, sort_order")
    .eq("wedding_id", wedding.id)
    .order("sort_order")
    .order("created_at");
  const list = photos ?? [];
  const i = list.findIndex((p) => p.id === id.data);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return null;
  [list[i], list[j]] = [list[j], list[i]];
  // A clean 0..n-1 order, so ties can never turn a move into a no-op.
  const changed = list.map((p, n) => ({ ...p, n })).filter((p) => p.sort_order !== p.n);
  const results = await Promise.all(changed.map((p) => supabase.from("wedding_photos").update({ sort_order: p.n }).eq("id", p.id)));
  const failed = results.find((r) => r.error)?.error;
  if (failed) return dbFail(failed, "move the photo");
  refreshWedding();
  return null;
}

export async function deletePhoto(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown photo.");
  const { data: photo } = await supabase
    .from("wedding_photos")
    .select("storage_path, is_cover")
    .eq("id", id.data)
    .eq("wedding_id", wedding.id)
    .maybeSingle();
  if (!photo) return fail("That photo is already gone.");
  const { error } = await supabase.from("wedding_photos").delete().eq("id", id.data);
  if (error) return dbFail(error, "delete the photo");
  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  if (photo.is_cover) {
    const { data: next } = await supabase.from("wedding_photos").select("id").eq("wedding_id", wedding.id).order("sort_order").limit(1).maybeSingle();
    if (next) await supabase.from("wedding_photos").update({ is_cover: true }).eq("id", next.id);
  }
  refreshWedding();
  return ok("Deleted");
}

// ── Gift QR codes ───────────────────────────────────────────────

type GiftMethod = { label: string; account_name?: string; qr_path: string };
const giftList = (v: unknown): GiftMethod[] => (Array.isArray(v) ? (v as GiftMethod[]) : []);

export async function addGiftQr(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const label = z.string().trim().min(1).max(40).safeParse(form.get("label"));
  const account = z.string().trim().max(80).safeParse(form.get("account_name") ?? "");
  const file = formFile(form, "file");
  if (!label.success || !account.success) return fail("Enter a label (up to 40 characters).");
  if (!file) return fail("Choose a QR image under 15 MB.");

  const img = await processImage(file, 800, "png");
  if (!img) return fail("That file could not be read as an image.");
  const path = `${wedding.id}/gifts/${crypto.randomUUID()}.png`;
  const up = await supabase.storage.from(BUCKET).upload(path, img.buffer, { contentType: "image/png", cacheControl: YEAR });
  if (up.error) return dbFail(up.error, "upload the QR code");

  const next = [...giftList(wedding.gift_methods), { label: label.data, ...(account.data ? { account_name: account.data } : {}), qr_path: path }];
  const { error } = await supabase.from("weddings").update({ gift_methods: next }).eq("id", wedding.id);
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return dbFail(error, "save the QR code");
  }
  refreshWedding();
  return ok("QR code added");
}

export async function removeGiftQr(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const path = z.string().max(300).safeParse(form.get("qr_path"));
  if (!path.success) return fail("Unknown QR code.");
  const list = giftList(wedding.gift_methods);
  if (!list.some((m) => m.qr_path === path.data)) return fail("That QR code is already gone.");
  const { error } = await supabase
    .from("weddings")
    .update({ gift_methods: list.filter((m) => m.qr_path !== path.data) })
    .eq("id", wedding.id);
  if (error) return dbFail(error, "remove the QR code");
  await supabase.storage.from(BUCKET).remove([path.data]);
  refreshWedding();
  return ok("Removed");
}

// ── Music ───────────────────────────────────────────────────────

export async function uploadMusic(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  const file = formFile(form, "file");
  const title = z.string().trim().max(80).safeParse(form.get("title") ?? "");
  if (!file) return fail("Choose a music file under 15 MB.");
  if (!title.success) return fail("The title is at most 80 characters.");
  const audio = await readAudio(file);
  if (!audio) return fail("Music must be MP3, M4A, AAC or OGG.");

  const path = `${wedding.id}/music/${crypto.randomUUID()}.${audio.ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, audio.buffer, { contentType: audio.contentType, cacheControl: YEAR });
  if (up.error) return dbFail(up.error, "upload the music");

  const { error } = await supabase
    .from("weddings")
    .update({ music_path: path, music_title: title.data || file.name.replace(/\.[^.]+$/, "") })
    .eq("id", wedding.id);
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return dbFail(error, "save the music");
  }
  if (wedding.music_path) await supabase.storage.from(BUCKET).remove([wedding.music_path]);
  refreshWedding();
  return ok("Music saved");
}

export async function removeMusic(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const { supabase, wedding } = ctx;
  if (!wedding.music_path) return null;
  const { error } = await supabase.from("weddings").update({ music_path: null, music_title: null }).eq("id", wedding.id);
  if (error) return dbFail(error, "remove the music");
  await supabase.storage.from(BUCKET).remove([wedding.music_path]);
  refreshWedding();
  return ok("Removed");
}
