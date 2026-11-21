import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { setWishHidden } from "../../actions";

export default function WishesPage(props: PageProps<"/admin/[slug]/wishes">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Wishes {...props} />
      </Suspense>
    </main>
  );
}

async function Wishes({ params }: PageProps<"/admin/[slug]/wishes">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: w } = await supabase.from("weddings").select("id, slug").eq("slug", slug).maybeSingle();
  if (!w) notFound();
  const { data: wishes } = await supabase
    .from("wishes")
    .select("id, author_name, message, is_hidden, created_at")
    .eq("wedding_id", w.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminNav slug={w.slug} current="/wishes" />
      <p className="mt-4 text-sm text-ink-soft">Hidden wishes stay visible only to the guest who wrote them.</p>
      <ul className="mt-4 divide-y divide-navy/20 border border-navy/30">
        {(wishes ?? []).length === 0 && <li className="px-4 py-3 text-ink-soft">No wishes yet.</li>}
        {(wishes ?? []).map((x) => (
          <li key={x.id} className="flex items-start gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-line break-words">{x.message}</p>
              <p className="label-caps mt-1 text-ink-soft">
                — {x.author_name} · {new Date(x.created_at).toLocaleString()}
                {x.is_hidden && " · HIDDEN"}
              </p>
            </div>
            <form action={setWishHidden}>
              <input type="hidden" name="id" value={x.id} />
              <input type="hidden" name="hidden" value={String(!x.is_hidden)} />
              <button className="label-caps underline">{x.is_hidden ? "Show" : "Hide"}</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
