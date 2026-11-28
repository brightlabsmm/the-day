"use server";

import { z } from "zod";
import { i18nFromForm, localInputToIso } from "../forms";
import { fail, Id, ok, type ActionResult } from "../schemas";
import { dbFail, refreshWedding, weddingFromForm } from "./context";

const EventInput = z.object({
  id: Id.optional(),
  kind: z.enum(["ceremony", "reception", "other"]),
  starts: z.string().min(1, "Enter when it starts."),
  ends: z.string(),
  mapUrl: z.string().trim().max(500).refine((v) => !v || v.startsWith("https://"), "The map link must start with https://"),
  sortOrder: z.coerce.number().int().min(0).max(99),
});

export async function saveEvent(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const parsed = EventInput.safeParse({
    id: form.get("id") || undefined,
    kind: form.get("kind"),
    starts: form.get("starts"),
    ends: form.get("ends") ?? "",
    mapUrl: form.get("mapUrl") ?? "",
    sortOrder: form.get("sortOrder") || 0,
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the event's details.");
  const e = parsed.data;
  const tz = ctx.wedding.timezone;
  const startsAt = localInputToIso(e.starts, tz);
  const endsAt = e.ends ? localInputToIso(e.ends, tz) : null;
  if (!startsAt || (e.ends && !endsAt)) return fail("Enter a valid date and time.");
  if (endsAt && endsAt <= startsAt) return fail("The end must be after the start.");

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
  const { error } = e.id
    ? await ctx.supabase.from("wedding_events").update(row).eq("id", e.id).eq("wedding_id", ctx.wedding.id)
    : await ctx.supabase.from("wedding_events").insert({ ...row, wedding_id: ctx.wedding.id });
  if (error) return dbFail(error);
  refreshWedding();
  return ok(e.id ? "Saved" : "Event added");
}

export async function deleteEvent(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const id = Id.safeParse(form.get("id"));
  if (!id.success) return fail("Unknown event.");
  const { error } = await ctx.supabase.from("wedding_events").delete().eq("id", id.data).eq("wedding_id", ctx.wedding.id);
  if (error) return dbFail(error, "delete the event");
  refreshWedding();
  return ok("Deleted");
}
