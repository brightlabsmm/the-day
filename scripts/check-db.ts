/**
 * Smoke test for RLS and the guest-facing database functions.
 * Runs against the local Supabase stack and leaves no data behind.
 *
 *   pnpm check:db
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = createClient<Database>(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
const admin = createClient<Database>(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

const SLUG = "thukha-maythet";
const TOKEN = "ko-aung-7k2f";
let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

async function main() {
  // Tables are closed to guests
  const { data: rows } = await anon.from("weddings").select("id");
  check("anon cannot read weddings table", (rows ?? []).length === 0, rows);
  const { data: guestRows } = await anon.from("guests").select("token");
  check("anon cannot read guest tokens", (guestRows ?? []).length === 0, guestRows);
  const { error: insErr } = await anon.from("wishes").insert({ wedding_id: "00000000-0000-4000-8000-000000000001", guest_id: "00000000-0000-4000-8000-000000000001", author_name: "x", message: "x" });
  check("anon cannot insert wishes directly", !!insErr);

  // Invitation
  const { data: inv } = await anon.rpc("get_invitation", { p_slug: SLUG, p_token: TOKEN });
  const i = inv as { guest: { display_name: string } | null; photos: unknown[]; events: unknown[] } | null;
  check("valid link returns guest name", i?.guest?.display_name === "Ko Aung", i?.guest);
  check("invitation has 8 photos and 1 event", i?.photos.length === 8 && i?.events.length === 1, [i?.photos.length, i?.events.length]);
  const { data: inv2 } = await anon.rpc("get_invitation", { p_slug: SLUG, p_token: "ko-aung-0000" });
  check("wrong token → no guest", (inv2 as { guest: unknown })?.guest === null, inv2);
  const { data: inv3 } = await anon.rpc("get_invitation", { p_slug: "nope", p_token: TOKEN });
  check("unknown wedding → null", inv3 === null, inv3);

  // Wishes
  const { data: none } = await anon.rpc("get_wishes", { p_slug: SLUG, p_token: "bad" });
  check("wishes hidden without a valid token", (none ?? []).length === 0, none);
  const { data: bad } = await anon.rpc("submit_wish", { p_slug: SLUG, p_token: "bad", p_author_name: "X", p_message: "Hi" });
  check("submit with bad token rejected", (bad as { error?: string })?.error === "invalid_guest", bad);
  const { data: empty } = await anon.rpc("submit_wish", { p_slug: SLUG, p_token: TOKEN, p_author_name: "Ko Aung", p_message: "   " });
  check("empty message rejected", (empty as { error?: string })?.error === "invalid_message", empty);
  const { data: first } = await anon.rpc("submit_wish", { p_slug: SLUG, p_token: TOKEN, p_author_name: "Ko Aung", p_message: "Congratulations!" });
  check("first wish saved", (first as { ok: boolean; updated: boolean })?.ok === true && !(first as { updated: boolean }).updated, first);
  const { data: second } = await anon.rpc("submit_wish", { p_slug: SLUG, p_token: TOKEN, p_author_name: "Ko Aung", p_message: "Congratulations, both of you!" });
  check("second submit updates, no duplicate", (second as { updated: boolean })?.updated === true, second);
  const { data: list } = await anon.rpc("get_wishes", { p_slug: SLUG, p_token: "ma-su-3hq9" });
  check("other guest sees the wish (not theirs)", list?.length === 1 && list[0].message === "Congratulations, both of you!" && list[0].is_mine === false, list);

  // Opened tracking
  await anon.rpc("mark_invitation_opened", { p_slug: SLUG, p_token: TOKEN });
  const { data: g } = await admin.from("guests").select("opened_at").eq("token", TOKEN).single();
  check("opened_at recorded", !!g?.opened_at, g);

  // Clean up
  await admin.from("wishes").delete().eq("wedding_id", "00000000-0000-4000-8000-000000000001");
  await admin.from("guests").update({ opened_at: null }).eq("token", TOKEN);

  console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
}

main();
