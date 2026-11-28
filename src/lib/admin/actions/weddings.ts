"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth";
import { fail, Slug, text, type ActionResult } from "../schemas";
import { generateWeddingCode } from "@/lib/tokens";
import { templateFor, templateKey } from "@/lib/templates";

/**
 * Starts a draft wedding from the couple's English names. Without a link code a random one is
 * used, so the link does not give away whose wedding it is.
 */
export async function createWedding(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const one = text(form, "partner_one", 80);
  const two = text(form, "partner_two", 80);
  if (!one || !two) return fail("Enter both names.");
  const typed = text(form, "slug", 60).toLowerCase();
  const slug = typed ? Slug.safeParse(typed) : { success: true as const, data: generateWeddingCode() };
  if (!slug.success) return fail("A link code uses lowercase letters, numbers and dashes only.");

  const { error } = await supabase.from("weddings").insert({
    slug: slug.data,
    partner_one_name: { en: one },
    partner_two_name: { en: two },
    template_key: templateKey(form.get("template_key")),
  });
  if (error) return fail(error.code === "23505" ? "That link code is already used." : `Could not create the wedding: ${error.message}`);
  revalidatePath("/admin");
  redirect(`/admin/weddings/${slug.data}/details`);
}

/** Starts a draft birthday from the name and the age line ("1st"), with the default birthday design. */
export async function createBirthday(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = text(form, "name", 80);
  const age = text(form, "age", 30);
  if (!name) return fail("Enter the name of the person whose birthday it is.");
  const typed = text(form, "slug", 60).toLowerCase();
  const slug = typed ? Slug.safeParse(typed) : { success: true as const, data: generateWeddingCode() };
  if (!slug.success) return fail("A link code uses lowercase letters, numbers and dashes only.");

  const { error } = await supabase.from("weddings").insert({
    slug: slug.data,
    partner_one_name: { en: name },
    partner_two_name: {},
    template_key: templateFor(form.get("template_key"), "birthday"),
    cover_text: { occasion: "birthday", ...(age ? { age: { en: age } } : {}) },
  });
  if (error) return fail(error.code === "23505" ? "That link code is already used." : `Could not create the birthday: ${error.message}`);
  revalidatePath("/admin");
  redirect(`/admin/weddings/${slug.data}/details`);
}
