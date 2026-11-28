import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth";
import { fail, Slug } from "../schemas";

/**
 * The signed-in admin's client and the wedding named by the form's hidden `slug` field.
 * Every wedding action starts here, so each one checks the admin itself.
 */
export async function weddingFromForm(form: FormData) {
  const { supabase } = await requireAdmin();
  const slug = Slug.safeParse(form.get("slug"));
  if (!slug.success) return { error: fail("This wedding's link code is not valid.") } as const;
  const { data: wedding } = await supabase.from("weddings").select("*").eq("slug", slug.data).maybeSingle();
  if (!wedding) return { error: fail("This wedding no longer exists.") } as const;
  return { error: null, supabase, wedding } as const;
}

/** A failed database call, said plainly. */
export const dbFail = (error: { message: string }, what = "save") => fail(`Could not ${what}: ${error.message}`);

/** Refreshes the wedding's admin pages and its invitation. */
export function refreshWedding() {
  revalidatePath("/admin/weddings/[slug]", "layout");
  revalidatePath("/w/[slug]", "page");
}
