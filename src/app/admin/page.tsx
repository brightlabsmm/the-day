import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "./actions";
import { createGiftCampaign } from "./gift-actions";

export default function AdminHome(props: PageProps<"/admin">) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Weddings />
        <GiftCampaigns {...props} />
      </Suspense>
    </main>
  );
}

const GIFT_ERRORS: Record<string, string> = {
  invalid: "Enter a title, and a link code of lowercase letters, numbers and dashes (or leave it empty).",
  taken: "That link code is already used.",
  failed: "Could not create the campaign.",
};

async function GiftCampaigns({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const query = await searchParams;
  const error = typeof query.gift_error === "string" ? GIFT_ERRORS[query.gift_error] : undefined;
  const { data: campaigns } = await supabase.from("gift_campaigns").select("slug, status, title").order("created_at");
  const input = "border border-navy/40 bg-white/70 px-3 py-2 outline-none focus:border-gold";

  return (
    <section className="mt-12" aria-labelledby="gifts-heading">
      <h2 id="gifts-heading" className="font-display text-3xl font-semibold">
        Gift invitations
      </h2>
      <ul className="mt-6 divide-y divide-navy/20 border border-navy/30">
        {(campaigns ?? []).map((c) => (
          <li key={c.slug}>
            <Link href={`/admin/gifts/${c.slug}`} className="flex items-center justify-between px-4 py-3 hover:bg-paper">
              <span>
                {(c.title as { en?: string; my?: string }).en || (c.title as { my?: string }).my || "Untitled"} <span className="text-ink-soft">/g/{c.slug}</span>
              </span>
              <span className="label-caps text-ink-soft">{c.status}</span>
            </Link>
          </li>
        ))}
        {(campaigns ?? []).length === 0 && <li className="px-4 py-4 text-ink-soft">No gift invitations yet.</li>}
      </ul>
      <form action={createGiftCampaign} className="mt-4 flex flex-wrap gap-2">
        <input name="title" required maxLength={120} placeholder="Title (English)" className={`${input} flex-1`} />
        <input name="slug" maxLength={60} placeholder="link-code (optional)" pattern="[a-z0-9]+(-[a-z0-9]+)*" className={`${input} w-48`} />
        <button className="label-caps border border-navy bg-navy px-5 py-2 text-ivory">New gift invitation</button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[#8a2c2c]">
          {error}
        </p>
      )}
    </section>
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
