"use server";

import { z } from "zod";
import { generateGuestToken } from "@/lib/tokens";
import { fail, Id, ok, type ActionResult } from "../schemas";
import { dbFail, refreshWedding, weddingFromForm } from "./context";

const GuestInput = z.object({
  name: z.string().trim().min(1, "Enter the guest's name.").max(80),
  nameMy: z.string().trim().max(80),
  group: z.string().trim().max(60),
  table: z.string().trim().max(40),
});

export async function addGuest(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const parsed = GuestInput.safeParse({
    name: form.get("name"),
    nameMy: form.get("nameMy") ?? "",
    group: form.get("group") ?? "",
    table: form.get("table") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the guest's details.");
  const { name, nameMy, group, table } = parsed.data;

  // Token collisions are very unlikely, but the column is unique, so retry a few times.
  let error = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    ({ error } = await ctx.supabase.from("guests").insert({
      wedding_id: ctx.wedding.id,
      display_name: name,
      display_name_my: nameMy || null,
      group_name: group || null,
      table_name: table || null,
      token: generateGuestToken(name),
    }));
    if (!error || error.code !== "23505") break;
  }
  if (error) return dbFail(error, "add the guest");
  refreshWedding();
  return ok(`Added ${name}`);
}

/** Sets or clears a guest's table for the "Find your seat" lookup. */
export async function setGuestTable(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const id = Id.safeParse(form.get("id"));
  const table = z.string().trim().max(40).safeParse(form.get("table") ?? "");
  if (!id.success || !table.success) return fail("A table name is at most 40 characters.");
  const { error } = await ctx.supabase
    .from("guests")
    .update({ table_name: table.data || null })
    .eq("id", id.data)
    .eq("wedding_id", ctx.wedding.id);
  if (error) return dbFail(error);
  refreshWedding();
  return ok();
}

export async function deleteGuest(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown guest.");
  const { error } = await ctx.supabase.from("guests").delete().eq("id", id.data).eq("wedding_id", ctx.wedding.id);
  if (error) return dbFail(error, "delete the guest");
  refreshWedding();
  return ok("Deleted");
}
