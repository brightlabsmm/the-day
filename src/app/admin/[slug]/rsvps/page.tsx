import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default function RsvpsPage(props: PageProps<"/admin/[slug]/rsvps">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Rsvps {...props} />
      </Suspense>
    </main>
  );
}

async function Rsvps({ params }: PageProps<"/admin/[slug]/rsvps">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: w } = await supabase.from("weddings").select("id, slug, rsvp_enabled").eq("slug", slug).maybeSingle();
  if (!w) notFound();
  const { data: rows } = await supabase
    .from("rsvps")
    .select("id, name, attending, party_size, note, created_at, guest_id")
    .eq("wedding_id", w.id)
    .order("created_at", { ascending: false });

  const yes = (rows ?? []).filter((r) => r.attending);
  const people = yes.reduce((n, r) => n + r.party_size, 0);

  return (
    <>
      <AdminNav slug={w.slug} current="/rsvps" />
      {!w.rsvp_enabled && (
        <p className="mt-4 border border-navy/30 bg-paper px-3 py-2 text-sm">
          The RSVP form is switched off. Turn it on under Details → Visibility.
        </p>
      )}
      <p className="mt-4 text-ink-soft">
        {rows?.length ?? 0} replies · {yes.length} attending ({people} {people === 1 ? "person" : "people"}) ·{" "}
        {(rows?.length ?? 0) - yes.length} declined
      </p>
      <ul className="mt-4 divide-y divide-navy/20 border border-navy/30">
        {(rows ?? []).length === 0 && <li className="px-4 py-3 text-ink-soft">No replies yet.</li>}
        {(rows ?? []).map((r) => (
          <li key={r.id} className="px-4 py-3">
            <p>
              <strong>{r.name}</strong> ·{" "}
              {r.attending ? `attending (${r.party_size})` : <span className="text-red-800">declined</span>}
              {r.guest_id && <span className="text-ink-soft"> · personal link</span>}
            </p>
            {r.note && <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{r.note}</p>}
            <p className="label-caps mt-1 text-ink-soft">{new Date(r.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
