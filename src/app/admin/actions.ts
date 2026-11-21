"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateGuestToken } from "@/lib/tokens";
import { templateKey } from "@/lib/templates";
import { dressCodeFromForm, faqFromForm, i18nFromForm, localInputToIso, storyFromForm, tipsFromForm } from "@/lib/admin/forms";

const Credentials = z.object({ email: z.email(), password: z.string().min(1).max(200) });

export async function signIn(form: FormData) {
  const parsed = Credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) redirect("/admin/login?error=invalid");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/admin/login?error=invalid");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const GuestInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  name: z.string().trim().min(1).max(80),
  nameMy: z.string().trim().max(80),
  group: z.string().trim().max(60),
  table: z.string().trim().max(40),
});

export async function addGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = GuestInput.safeParse({
    slug: form.get("slug"),
    name: form.get("name"),
    nameMy: form.get("nameMy") ?? "",
    group: form.get("group") ?? "",
    table: form.get("table") ?? "",
  });
  if (!parsed.success) return;
  const { slug, name, nameMy, group, table } = parsed.data;

  const { data: wedding } = await supabase.from("weddings").select("id").eq("slug", slug).single();
  if (!wedding) return;

  // Token collisions are very unlikely, but the column is unique, so retry a few times.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      display_name: name,
      display_name_my: nameMy || null,
      group_name: group || null,
      table_name: table || null,
      token: generateGuestToken(name),
    });
    if (!error || error.code !== "23505") break;
  }
  revalidatePath("/admin/[slug]", "page");
}

/** Sets or clears a guest's table for the "Find your seat" lookup. */
export async function setGuestTable(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const table = z.string().trim().max(40).safeParse(form.get("table") ?? "");
  if (!id.success || !table.success) return;
  await supabase.from("guests").update({ table_name: table.data || null }).eq("id", id.data);
  revalidatePath("/admin/[slug]", "page");
}

export async function deleteGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("guests").delete().eq("id", id.data);
  revalidatePath("/admin/[slug]", "page");
}

// ── Wedding details ─────────────────────────────────────────────

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);

function familySide(form: FormData, side: "partner_one" | "partner_two") {
  const lineage = i18nFromForm(form, `${side}_lineage`);
  const credentials = String(form.get(`${side}_credentials`) ?? "").trim().slice(0, 60);
  return {
    ...(Object.keys(lineage).length ? { lineage } : {}),
    ...(credentials ? { credentials } : {}),
  };
}

export async function saveWeddingDetails(form: FormData) {
  const { supabase } = await requireAdmin();
  const slug = Slug.safeParse(form.get("slug"));
  const status = z.enum(["draft", "published"]).safeParse(form.get("status"));
  const names = {
    partner_one_name: i18nFromForm(form, "partner_one_name"),
    partner_two_name: i18nFromForm(form, "partner_two_name"),
  };
  if (!slug.success || !status.success) return;
  // Both partners need a name in at least one language.
  if (!Object.keys(names.partner_one_name).length || !Object.keys(names.partner_two_name).length) return;

  await supabase
    .from("weddings")
    .update({
      status: status.data,
      template_key: templateKey(form.get("template_key")),
      ...names,
      monogram: String(form.get("monogram") ?? "").trim().slice(0, 12) || null,
      tagline: i18nFromForm(form, "tagline"),
      invitation_text: i18nFromForm(form, "invitation_text"),
      note: i18nFromForm(form, "note"),
      closing_quote: i18nFromForm(form, "closing_quote"),
      cover_text: {
        corner_left: i18nFromForm(form, "cover_corner_left"),
        corner_right: i18nFromForm(form, "cover_corner_right"),
        script: i18nFromForm(form, "cover_script"),
        footer: i18nFromForm(form, "cover_footer"),
      },
      family: {
        partner_one: familySide(form, "partner_one"),
        partner_two: familySide(form, "partner_two"),
      },
      wishes_enabled: form.get("wishes_enabled") === "on",
      public_wishes: form.get("public_wishes") === "on",
      rsvp_enabled: form.get("rsvp_enabled") === "on",
      dress_code: dressCodeFromForm(form),
      faq: faqFromForm(form),
      good_to_know: tipsFromForm(form),
      seating_enabled: form.get("seating_enabled") === "on",
      story: storyFromForm(form),
      wishes_editable: form.get("wishes_editable") === "on",
    })
    .eq("slug", slug.data);
  revalidatePath("/admin/[slug]", "layout");
  revalidatePath("/w/[slug]", "page");
}

// ── Events ──────────────────────────────────────────────────────

const EventInput = z.object({
  slug: Slug,
  id: z.uuid().optional(),
  kind: z.enum(["ceremony", "reception", "other"]),
  starts: z.string().min(1),
  ends: z.string(),
  mapUrl: z.string().trim().max(500),
  sortOrder: z.coerce.number().int().min(0).max(99),
});

export async function saveEvent(form: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = EventInput.safeParse({
    slug: form.get("slug"),
    id: form.get("id") || undefined,
    kind: form.get("kind"),
    starts: form.get("starts"),
    ends: form.get("ends") ?? "",
    mapUrl: form.get("mapUrl") ?? "",
    sortOrder: form.get("sortOrder") || 0,
  });
  if (!parsed.success) return;
  const e = parsed.data;
  if (e.mapUrl && !/^https:\/\//.test(e.mapUrl)) return;

  const { data: wedding } = await supabase.from("weddings").select("id, timezone").eq("slug", e.slug).single();
  if (!wedding) return;
  const startsAt = localInputToIso(e.starts, wedding.timezone);
  const endsAt = e.ends ? localInputToIso(e.ends, wedding.timezone) : null;
  if (!startsAt || (e.ends && !endsAt) || (endsAt && endsAt <= startsAt)) return;

  const row = {
    kind: e.kind,
    title: i18nFromForm(form, "title"),
    starts_at: startsAt,
    ends_at: endsAt,
    myanmar_date_text: i18nFromForm(form, "myanmar_date_text"),
    venue_name: i18nFromForm(form, "venue_name"),
    venue_address: i18nFromForm(form, "venue_address"),
    map_url: e.mapUrl || null,
    sort_order: e.sortOrder,
  };
  if (e.id) await supabase.from("wedding_events").update(row).eq("id", e.id).eq("wedding_id", wedding.id);
  else await supabase.from("wedding_events").insert({ ...row, wedding_id: wedding.id });
  revalidatePath("/admin/[slug]/events", "page");
  revalidatePath("/w/[slug]", "page");
}

export async function deleteEvent(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("wedding_events").delete().eq("id", id.data);
  revalidatePath("/admin/[slug]/events", "page");
  revalidatePath("/w/[slug]", "page");
}

// ── Wishes moderation ───────────────────────────────────────────

export async function setWishHidden(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("wishes").update({ is_hidden: form.get("hidden") === "true" }).eq("id", id.data);
  revalidatePath("/admin/[slug]/wishes", "page");
  revalidatePath("/w/[slug]", "page");
}
