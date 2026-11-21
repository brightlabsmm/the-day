"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateGuestToken } from "@/lib/tokens";

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
});

export async function addGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = GuestInput.safeParse({
    slug: form.get("slug"),
    name: form.get("name"),
    nameMy: form.get("nameMy") ?? "",
    group: form.get("group") ?? "",
  });
  if (!parsed.success) return;
  const { slug, name, nameMy, group } = parsed.data;

  const { data: wedding } = await supabase.from("weddings").select("id").eq("slug", slug).single();
  if (!wedding) return;

  // Token collisions are very unlikely, but the column is unique, so retry a few times.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      display_name: name,
      display_name_my: nameMy || null,
      group_name: group || null,
      token: generateGuestToken(name),
    });
    if (!error || error.code !== "23505") break;
  }
  revalidatePath("/admin/[slug]", "page");
}

export async function deleteGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await supabase.from("guests").delete().eq("id", id.data);
  revalidatePath("/admin/[slug]", "page");
}
