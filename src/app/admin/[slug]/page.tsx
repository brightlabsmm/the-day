import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { CopyButton } from "@/components/admin/copy-button";
import { addGuest, deleteGuest, setGuestTable } from "../actions";

export default function GuestsPage(props: PageProps<"/admin/[slug]">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Guests {...props} />
      </Suspense>
    </main>
  );
}

async function Guests({ params }: PageProps<"/admin/[slug]">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: wedding } = await supabase.from("weddings").select("id, slug").eq("slug", slug).maybeSingle();
  if (!wedding) notFound();

  const { data: guests } = await supabase
    .from("guests")
    .select("id, display_name, display_name_my, group_name, table_name, token, opened_at")
    .eq("wedding_id", wedding.id)
    .order("created_at");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const opened = (guests ?? []).filter((g) => g.opened_at).length;
  const input = "border border-navy/40 bg-white/70 px-3 py-2 outline-none focus:border-gold";

  return (
    <>
      <AdminNav slug={wedding.slug} current="" />
      <h2 className="font-display mt-6 text-2xl font-semibold">Guests</h2>
      <p className="text-ink-soft">
        {opened} of {guests?.length ?? 0} opened
      </p>

      <form action={addGuest} className="mt-6 flex flex-wrap gap-2">
        <input type="hidden" name="slug" value={wedding.slug} />
        <input name="name" required maxLength={80} placeholder="Name (English)" className={input} />
        <input name="nameMy" maxLength={80} placeholder="အမည် (မြန်မာ)" lang="my" className={input} />
        <input name="group" maxLength={60} placeholder="Group" className={input} />
        <input name="table" maxLength={40} placeholder="Table (optional)" className={`${input} w-40`} />
        <button className="label-caps border border-navy bg-navy px-5 py-2 text-ivory">Add guest</button>
      </form>

      <ul className="mt-6 divide-y divide-navy/20 border border-navy/30">
        {(guests ?? []).map((g) => {
          const link = (lang: "my" | "en") => `${site}/w/${wedding.slug}?g=${g.token}&lang=${lang}`;
          return (
            <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p>
                  {g.display_name}
                  {g.display_name_my && <span lang="my"> · {g.display_name_my}</span>}
                </p>
                <p className="text-sm text-ink-soft">
                  {g.group_name ?? "—"} · {g.opened_at ? `opened ${new Date(g.opened_at).toLocaleString()}` : "not opened"}
                </p>
              </div>
              <form action={setGuestTable} className="flex items-center gap-1">
                <input type="hidden" name="id" value={g.id} />
                <input name="table" defaultValue={g.table_name ?? ""} maxLength={40} placeholder="Table" aria-label={`Table for ${g.display_name}`} className="w-24 border border-navy/30 bg-white/70 px-2 py-1 text-sm outline-none focus:border-gold" />
                <button className="label-caps text-xs underline">Save</button>
              </form>
              <CopyButton text={link("my")} label="Copy မြန်မာ link" />
              <CopyButton text={link("en")} label="Copy EN link" />
              <form action={deleteGuest}>
                <input type="hidden" name="id" value={g.id} />
                <button className="label-caps text-red-800 underline">Delete</button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}
