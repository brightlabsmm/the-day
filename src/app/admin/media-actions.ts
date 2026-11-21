"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { i18nFromForm } from "@/lib/admin/forms";
import { formFile, processImage, readAudio } from "@/lib/admin/uploads";

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);
const Id = z.uuid();

async function context(form: FormData) {
  const { supabase } = await requireAdmin();
  const slug = Slug.safeParse(form.get("slug"));
  if (!slug.success) redirect("/admin");
  const { data: wedding } = await supabase.from("weddings").select("*").eq("slug", slug.data).maybeSingle();
  if (!wedding) redirect("/admin");
  return { supabase, wedding };
}

const back = (slug: string, error?: string): never =>
  redirect(`/admin/${slug}/media${error ? `?error=${error}` : ""}`);

function refresh() {
  revalidatePath("/admin/[slug]/media", "page");
  revalidatePath("/w/[slug]", "page");
}

// ── Photos ──────────────────────────────────────────────────────

export async function uploadPhoto(form: FormData) {
  const { supabase, wedding } = await context(form);
  const file = formFile(form, "file");
  if (!file) back(wedding.slug, "file");
  const kind = z.enum(["portrait", "couple", "traditional", "spread"]).safeParse(form.get("kind"));
  if (!kind.success) back(wedding.slug, "file");

  const img = await processImage(file!, 2400, "webp");
  if (!img) back(wedding.slug, "image");

  const { data: existing } = await supabase
    .from("wedding_photos")
    .select("sort_order, is_cover")
    .eq("wedding_id", wedding.id);
  if ((existing?.length ?? 0) >= 8) back(wedding.slug, "limit");

  const path = `${wedding.id}/photos/${crypto.randomUUID()}.webp`;
  const up = await supabase.storage
    .from("wedding-media")
    .upload(path, img!.buffer, { contentType: img!.contentType, cacheControl: "31536000" });
  if (up.error) back(wedding.slug, "upload");

  const { error } = await supabase.from("wedding_photos").insert({
    wedding_id: wedding.id,
    storage_path: path,
    width: img!.width,
    height: img!.height,
    kind: kind.data!,
    alt: i18nFromForm(form, "alt"),
    is_cover: !existing?.some((p) => p.is_cover),
    sort_order: Math.max(-1, ...(existing ?? []).map((p) => p.sort_order)) + 1,
  });
  if (error) {
    await supabase.storage.from("wedding-media").remove([path]);
    back(wedding.slug, "limit");
  }
  refresh();
  back(wedding.slug);
}

export async function setCover(form: FormData) {
  const { supabase, wedding } = await context(form);
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("wedding_photos").update({ is_cover: false }).eq("wedding_id", wedding.id);
  await supabase.from("wedding_photos").update({ is_cover: true }).eq("id", id.data).eq("wedding_id", wedding.id);
  refresh();
}

export async function movePhoto(form: FormData) {
  const { supabase, wedding } = await context(form);
  const id = Id.safeParse(form.get("id"));
  const dir = form.get("dir") === "up" ? -1 : 1;
  if (!id.success) return;
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("id")
    .eq("wedding_id", wedding.id)
    .order("sort_order")
    .order("created_at");
  const ids = (photos ?? []).map((p) => p.id);
  const i = ids.indexOf(id.data);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  // Rewrite a clean 0..n-1 order so ties can never make a move a no-op.
  await Promise.all(ids.map((pid, n) => supabase.from("wedding_photos").update({ sort_order: n }).eq("id", pid)));
  refresh();
}

export async function deletePhoto(form: FormData) {
  const { supabase, wedding } = await context(form);
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return;
  const { data: photo } = await supabase
    .from("wedding_photos")
    .select("storage_path, is_cover")
    .eq("id", id.data)
    .eq("wedding_id", wedding.id)
    .maybeSingle();
  if (!photo) return;
  await supabase.from("wedding_photos").delete().eq("id", id.data);
  await supabase.storage.from("wedding-media").remove([photo.storage_path]);
  if (photo.is_cover) {
    const { data: next } = await supabase
      .from("wedding_photos")
      .select("id")
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from("wedding_photos").update({ is_cover: true }).eq("id", next.id);
  }
  refresh();
}

// ── Gift QR codes ───────────────────────────────────────────────

type GiftMethod = { label: string; account_name?: string; qr_path: string };
const giftList = (v: unknown): GiftMethod[] => (Array.isArray(v) ? (v as GiftMethod[]) : []);

export async function addGift(form: FormData) {
  const { supabase, wedding } = await context(form);
  const label = z.string().trim().min(1).max(40).safeParse(form.get("label"));
  const account = z.string().trim().max(80).safeParse(form.get("account_name") ?? "");
  const file = formFile(form, "file");
  if (!label.success || !account.success || !file) back(wedding.slug, "gift");

  const img = await processImage(file!, 800, "png");
  if (!img) back(wedding.slug, "image");
  const path = `${wedding.id}/gifts/${crypto.randomUUID()}.png`;
  const up = await supabase.storage
    .from("wedding-media")
    .upload(path, img!.buffer, { contentType: "image/png", cacheControl: "31536000" });
  if (up.error) back(wedding.slug, "upload");

  const next = [
    ...giftList(wedding.gift_methods),
    { label: label.data!, ...(account.data ? { account_name: account.data } : {}), qr_path: path },
  ];
  await supabase.from("weddings").update({ gift_methods: next }).eq("id", wedding.id);
  refresh();
  back(wedding.slug);
}

export async function removeGift(form: FormData) {
  const { supabase, wedding } = await context(form);
  const path = z.string().max(300).safeParse(form.get("qr_path"));
  if (!path.success) return;
  const list = giftList(wedding.gift_methods);
  const target = list.find((m) => m.qr_path === path.data);
  if (!target) return;
  await supabase
    .from("weddings")
    .update({ gift_methods: list.filter((m) => m.qr_path !== path.data) })
    .eq("id", wedding.id);
  await supabase.storage.from("wedding-media").remove([target.qr_path]);
  refresh();
}

// ── Music ───────────────────────────────────────────────────────

export async function uploadMusic(form: FormData) {
  const { supabase, wedding } = await context(form);
  const file = formFile(form, "file");
  const title = z.string().trim().max(80).safeParse(form.get("title") ?? "");
  if (!file || !title.success) back(wedding.slug, "file");
  const audio = await readAudio(file!);
  if (!audio) back(wedding.slug, "audio");

  const path = `${wedding.id}/music/${crypto.randomUUID()}.${audio!.ext}`;
  const up = await supabase.storage
    .from("wedding-media")
    .upload(path, audio!.buffer, { contentType: audio!.contentType, cacheControl: "31536000" });
  if (up.error) back(wedding.slug, "upload");

  await supabase
    .from("weddings")
    .update({ music_path: path, music_title: title.data || file!.name.replace(/\.[^.]+$/, "") })
    .eq("id", wedding.id);
  if (wedding.music_path) await supabase.storage.from("wedding-media").remove([wedding.music_path]);
  refresh();
  back(wedding.slug);
}

export async function removeMusic(form: FormData) {
  const { supabase, wedding } = await context(form);
  if (!wedding.music_path) return;
  await supabase.from("weddings").update({ music_path: null, music_title: null }).eq("id", wedding.id);
  await supabase.storage.from("wedding-media").remove([wedding.music_path]);
  refresh();
}
