"use server";

import { fail, Id, ok, type ActionResult } from "../schemas";
import { dbFail, refreshWedding, weddingFromForm } from "./context";

/** Hides a wish from everyone but its writer, or shows it again. */
export async function setWishHidden(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown wish.");
  const hidden = form.get("hidden") === "true";
  const { error } = await ctx.supabase.from("wishes").update({ is_hidden: hidden }).eq("id", id.data).eq("wedding_id", ctx.wedding.id);
  if (error) return dbFail(error);
  refreshWedding();
  return ok(hidden ? "Hidden" : "Shown");
}
