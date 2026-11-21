import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav, I18nField, inputClass } from "@/components/admin/admin-nav";
import { saveWeddingDetails } from "../../actions";

export default function DetailsPage(props: PageProps<"/admin/[slug]/details">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Details {...props} />
      </Suspense>
    </main>
  );
}

async function Details({ params }: PageProps<"/admin/[slug]/details">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: w } = await supabase.from("weddings").select("*").eq("slug", slug).maybeSingle();
  if (!w) notFound();

  return (
    <>
      <AdminNav slug={w.slug} current="/details" />
      <form action={saveWeddingDetails} className="mt-6 space-y-5">
        <input type="hidden" name="slug" value={w.slug} />
        <I18nField name="partner_one_name" label="Partner one name" value={w.partner_one_name} />
        <I18nField name="partner_two_name" label="Partner two name" value={w.partner_two_name} />
        <label className="label-caps block">
          Monogram
          <input name="monogram" maxLength={12} defaultValue={w.monogram ?? ""} className={`${inputClass} mt-1 max-w-40`} />
        </label>
        {(["partner_one", "partner_two"] as const).map((side, n) => {
          const f = ((w.family as Record<string, { lineage?: unknown; credentials?: string }>)[side] ?? {});
          return (
            <div key={side} className="space-y-2 border border-navy/20 p-3">
              <I18nField name={`${side}_lineage`} label={`Partner ${n + 1} family lineage (optional)`} value={f.lineage} multiline />
              <label className="label-caps block">
                Partner {n + 1} credentials (optional, e.g. B.E.(Civil))
                <input name={`${side}_credentials`} maxLength={60} defaultValue={f.credentials ?? ""} className={`${inputClass} mt-1 max-w-72`} />
              </label>
            </div>
          );
        })}
        <I18nField name="tagline" label="Tagline" value={w.tagline} />
        <I18nField name="invitation_text" label="Invitation message" value={w.invitation_text} multiline />
        <I18nField name="note" label="Note on the details card" value={w.note} multiline />
        <I18nField name="closing_quote" label="Closing quote" value={w.closing_quote} multiline />

        <fieldset className="space-y-2">
          <legend className="label-caps">Visibility and wishes</legend>
          <label className="block">
            Status{" "}
            <select name="status" defaultValue={w.status} className="border border-navy/40 bg-white/70 px-2 py-1">
              <option value="draft">Draft (hidden from guests)</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block">
            <input type="checkbox" name="wishes_enabled" defaultChecked={w.wishes_enabled} /> Guests can leave wishes
          </label>
          <label className="block">
            <input type="checkbox" name="wishes_editable" defaultChecked={w.wishes_editable} /> Guests can edit their wish
          </label>
        </fieldset>
        <button className="label-caps border border-navy bg-navy px-6 py-2.5 text-ivory">Save details</button>
      </form>
    </>
  );
}
