import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { GiftAdminNav } from "@/components/admin/gift-admin-nav";
import { deleteGiftSignup } from "../../../gift-actions";

export default function GiftSignupsPage(props: PageProps<"/admin/gifts/[slug]/signups">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Signups {...props} />
      </Suspense>
    </main>
  );
}

const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Yangon" });

async function Signups({ params }: PageProps<"/admin/gifts/[slug]/signups">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: c } = await supabase.from("gift_campaigns").select("id, slug, invite_enabled").eq("slug", slug).maybeSingle();
  if (!c) notFound();
  const { data: rows } = await supabase
    .from("gift_signups")
    .select("id, name, contact, intention, created_at")
    .eq("campaign_id", c.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <GiftAdminNav slug={c.slug} current="/signups" />
      {!c.invite_enabled && (
        <p className="mt-4 border border-navy/30 bg-paper px-3 py-2 text-sm">The sign-up form is switched off for this campaign.</p>
      )}
      <p className="mt-4 text-ink-soft">{rows?.length ?? 0} sign-ups</p>
      <ul className="mt-4 divide-y divide-navy/20 border border-navy/30">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm break-all">{r.contact}</p>
              {r.intention && <p className="text-sm text-ink-soft">{r.intention}</p>}
            </div>
            <p className="text-sm text-ink-soft">{when.format(new Date(r.created_at))}</p>
            <form action={deleteGiftSignup}>
              <input type="hidden" name="id" value={r.id} />
              <button className="label-caps text-ink-soft underline">Delete</button>
            </form>
          </li>
        ))}
        {(rows ?? []).length === 0 && <li className="px-4 py-6 text-center text-ink-soft">No sign-ups yet.</li>}
      </ul>
    </>
  );
}
