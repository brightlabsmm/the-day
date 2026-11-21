import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "./actions";

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Weddings />
      </Suspense>
    </main>
  );
}

async function Weddings() {
  const { supabase, user } = await requireAdmin();
  const { data: weddings } = await supabase
    .from("weddings")
    .select("slug, status, partner_one_name, partner_two_name")
    .order("created_at");

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Weddings</h1>
        <form action={signOut}>
          <button className="label-caps text-ink-soft underline">Sign out ({user.email})</button>
        </form>
      </header>
      <ul className="mt-6 divide-y divide-navy/20 border border-navy/30">
        {(weddings ?? []).map((w) => {
          const one = (w.partner_one_name as { en?: string }).en ?? "";
          const two = (w.partner_two_name as { en?: string }).en ?? "";
          return (
            <li key={w.slug}>
              <Link href={`/admin/${w.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-paper">
                <span>
                  {one} &amp; {two} <span className="text-ink-soft">/{w.slug}</span>
                </span>
                <span className="label-caps text-ink-soft">{w.status}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
