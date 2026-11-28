"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GIFT_ICONS, GIFT_KINDS, GIFT_VIEWS, MAX_GIFTS } from "@/lib/gift";
import { generateWeddingCode } from "@/lib/tokens";
import { requireAdmin } from "../auth";
import { i18nFromForm } from "../forms";
import { intentionsFromForm, normaliseCode } from "../gift-forms";
import { checked, fail, Id, ok, Slug, Status, text, type ActionResult } from "../schemas";
import { dbFail } from "./context";

function refreshCampaign() {
  revalidatePath("/admin/gifts/[slug]", "layout");
  revalidatePath("/g/[slug]", "page");
}

/**
 * Creates a draft campaign with its empty gift slots. Without a link code a random one is used,
 * so the link does not give away who it is for.
 */
export async function createGiftCampaign(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const titleEn = text(form, "title", 120);
  if (!titleEn) return fail("Enter a title.");
  const typed = text(form, "slug", 60).toLowerCase();
  const slug = typed ? Slug.safeParse(typed) : { success: true as const, data: generateWeddingCode() };
  if (!slug.success) return fail("A link code uses lowercase letters, numbers and dashes only.");

  const { data: campaign, error } = await supabase.from("gift_campaigns").insert({ slug: slug.data, title: { en: titleEn } }).select("id, slug").single();
  if (error || !campaign) return fail(error?.code === "23505" ? "That link code is already used." : "Could not create the campaign.");

  const slots = await supabase.from("gift_items").insert(Array.from({ length: MAX_GIFTS }, (_, i) => ({ campaign_id: campaign.id, position: i + 1 })));
  if (slots.error) return dbFail(slots.error, "create the gift slots");
  revalidatePath("/admin");
  redirect(`/admin/gifts/${campaign.slug}`);
}

export async function saveGiftCampaign(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const slug = Slug.safeParse(form.get("slug"));
  const status = Status.safeParse(form.get("status"));
  const view = z.enum(GIFT_VIEWS).safeParse(form.get("default_view"));
  const shopUrl = text(form, "shop_url", 500);
  const vip = normaliseCode(form.get("vip_code"));
  if (!slug.success || !status.success || !view.success) return fail("Choose a status and a view.");
  if (shopUrl && !shopUrl.startsWith("https://")) return fail("The shop link must start with https://");
  if (vip === undefined) return fail("The VIP code may use only A–Z, 0–9, _ and -.");

  const { error } = await supabase
    .from("gift_campaigns")
    .update({
      status: status.data,
      title: i18nFromForm(form, "title"),
      subtitle: i18nFromForm(form, "subtitle"),
      default_view: view.data,
      shop_url: shopUrl || null,
      invite_enabled: checked(form, "invite_enabled"),
      invite_title: i18nFromForm(form, "invite_title"),
      invite_text: i18nFromForm(form, "invite_text"),
      invite_intentions: intentionsFromForm(form),
      vip_code: vip,
    })
    .eq("slug", slug.data);
  if (error) return dbFail(error);
  refreshCampaign();
  return ok();
}

const ItemInput = z.object({ id: Id, icon: z.enum(GIFT_ICONS), kind: z.enum(GIFT_KINDS) });

/** Saves one gift slot. Clearing both titles hides the gift from the page. */
export async function saveGiftItem(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = ItemInput.safeParse({ id: form.get("id"), icon: form.get("icon"), kind: form.get("kind") });
  const code = normaliseCode(form.get("code"));
  if (!parsed.success) return fail("Choose an icon and a kind.");
  if (code === undefined) return fail("The code may use only A–Z, 0–9, _ and -.");

  const { error } = await supabase
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
  if (error) return dbFail(error);
  refreshCampaign();
  return ok();
}

export async function deleteGiftSignup(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown sign-up.");
  const { error } = await supabase.from("gift_signups").delete().eq("id", id.data);
  if (error) return dbFail(error, "delete the sign-up");
  refreshCampaign();
  return ok("Deleted");
}
