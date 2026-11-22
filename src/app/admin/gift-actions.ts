"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { i18nFromForm } from "@/lib/admin/forms";
import { intentionsFromForm, normaliseCode } from "@/lib/admin/gift-forms";
import { GIFT_ICONS, GIFT_KINDS, GIFT_VIEWS, MAX_GIFTS } from "@/lib/gift";
import { generateWeddingCode } from "@/lib/tokens";

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);

/**
 * Creates a draft campaign with twelve empty gift slots. Without a slug a
 * random code is used, so the link does not give away who it is for.
 */
export async function createGiftCampaign(form: FormData) {
  const { supabase } = await requireAdmin();
  const typed = String(form.get("slug") ?? "").trim().toLowerCase();
  const slug = typed ? Slug.safeParse(typed) : { success: true as const, data: generateWeddingCode() };
  const titleEn = String(form.get("title") ?? "").trim().slice(0, 120);
  if (!slug.success || !titleEn) redirect("/admin?gift_error=invalid");

  const { data: campaign, error } = await supabase
    .from("gift_campaigns")
    .insert({ slug: slug.data, title: { en: titleEn } })
    .select("id, slug")
    .single();
  if (error || !campaign) redirect(`/admin?gift_error=${error?.code === "23505" ? "taken" : "failed"}`);

  await supabase.from("gift_items").insert(
    Array.from({ length: MAX_GIFTS }, (_, i) => ({ campaign_id: campaign.id, position: i + 1 })),
  );
  revalidatePath("/admin");
  redirect(`/admin/gifts/${campaign.slug}`);
}

export async function saveGiftCampaign(form: FormData) {
  const { supabase } = await requireAdmin();
  const slug = Slug.safeParse(form.get("slug"));
  const status = z.enum(["draft", "published"]).safeParse(form.get("status"));
  const view = z.enum(GIFT_VIEWS).safeParse(form.get("default_view"));
  const shopUrl = String(form.get("shop_url") ?? "").trim().slice(0, 500);
  const vip = normaliseCode(form.get("vip_code"));
  if (!slug.success || !status.success || !view.success) return;
  if (shopUrl && !/^https:\/\//.test(shopUrl)) return;
  if (vip === undefined) return;

  await supabase
    .from("gift_campaigns")
    .update({
      status: status.data,
      title: i18nFromForm(form, "title"),
      subtitle: i18nFromForm(form, "subtitle"),
      default_view: view.data,
      shop_url: shopUrl || null,
      invite_enabled: form.get("invite_enabled") === "on",
      invite_title: i18nFromForm(form, "invite_title"),
      invite_text: i18nFromForm(form, "invite_text"),
      invite_intentions: intentionsFromForm(form),
      vip_code: vip,
    })
    .eq("slug", slug.data);
  revalidatePath("/admin/gifts/[slug]", "layout");
  revalidatePath("/g/[slug]", "page");
}

const ItemInput = z.object({
  id: z.uuid(),
  icon: z.enum(GIFT_ICONS),
  kind: z.enum(GIFT_KINDS),
});

/** Saves one gift slot. Clearing both titles hides the gift from the page. */
export async function saveGiftItem(form: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = ItemInput.safeParse({ id: form.get("id"), icon: form.get("icon"), kind: form.get("kind") });
  const code = normaliseCode(form.get("code"));
  if (!parsed.success || code === undefined) return;

  await supabase
    .from("gift_items")
    .update({
      icon: parsed.data.icon,
      kind: parsed.data.kind,
      category: i18nFromForm(form, "category"),
      title: i18nFromForm(form, "title"),
      description: i18nFromForm(form, "description"),
      detail_title: i18nFromForm(form, "detail_title"),
      detail_text: i18nFromForm(form, "detail_text"),
      code,
    })
    .eq("id", parsed.data.id);
  revalidatePath("/admin/gifts/[slug]", "page");
  revalidatePath("/g/[slug]", "page");
}

export async function deleteGiftSignup(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("gift_signups").delete().eq("id", id.data);
  revalidatePath("/admin/gifts/[slug]/signups", "page");
}
