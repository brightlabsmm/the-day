"use server";

import { z } from "zod";
import { createSupabaseGuestClient } from "@/lib/supabase/server";

export type SeatMatch = { name: string; nameMy: string | null; table: string };
export type SeatResult = { ok: true; matches: SeatMatch[] } | { ok: false };

const Row = z.array(z.object({ name: z.string(), name_my: z.string().nullable(), table: z.string() }));

/** Looks up a guest's table by name. Returns at most six matches, name and table only. */
export async function findSeat(slug: string, query: string): Promise<SeatResult> {
  const parsed = z
    .object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60), query: z.string().trim().min(2).max(60) })
    .safeParse({ slug, query });
  if (!parsed.success) return { ok: true, matches: [] };
  const { data, error } = await createSupabaseGuestClient().rpc("find_seat", { p_slug: parsed.data.slug, p_query: parsed.data.query });
  if (error) return { ok: false };
  const rows = Row.safeParse(data ?? []);
  return { ok: true, matches: rows.success ? rows.data.map((r) => ({ name: r.name, nameMy: r.name_my, table: r.table })) : [] };
}
