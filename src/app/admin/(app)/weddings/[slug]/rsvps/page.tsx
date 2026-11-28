import { Suspense } from "react";
import { getWedding, formatWhen } from "@/lib/admin/data";
import { Badge, Card, Empty, Loading, Notice, Stats } from "@/components/admin/ui";

export default function RsvpsPage(props: PageProps<"/admin/weddings/[slug]/rsvps">) {
  return (
    <Suspense fallback={<Loading />}>
      <Rsvps {...props} />
    </Suspense>
  );
}

async function Rsvps({ params }: PageProps<"/admin/weddings/[slug]/rsvps">) {
  const { slug } = await params;
  const { supabase, wedding: w } = await getWedding(slug);
  const { data } = await supabase
    .from("rsvps")
    .select("id, name, attending, party_size, note, created_at, guest_id")
    .eq("wedding_id", w.id)
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const yes = rows.filter((r) => r.attending);
  const people = yes.reduce((n, r) => n + r.party_size, 0);

  return (
    <div className="space-y-6">
      {!w.rsvp_enabled && <Notice>The RSVP form is switched off. Turn it on under Details → Design &amp; visibility.</Notice>}
      <Stats
        items={[
          { label: "Replies", value: rows.length },
          { label: "Attending", value: yes.length },
          { label: "People coming", value: people },
          { label: "Declined", value: rows.length - yes.length },
        ]}
      />
      <Card title="Replies">
        {rows.length === 0 ? (
          <Empty>No replies yet.</Empty>
        ) : (
          <ul className="-mx-5 -my-5 divide-y divide-[#efe6d8]">
            {rows.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{r.name}</p>
                  {r.attending ? <Badge tone="yes">Attending · {r.party_size}</Badge> : <Badge tone="no">Declined</Badge>}
                  {r.guest_id && <Badge>Personal link</Badge>}
                  <span className="ml-auto text-xs text-[#8a7f75]">{formatWhen(r.created_at, w.timezone)}</span>
                </div>
                {r.note && <p className="mt-1.5 text-sm whitespace-pre-line text-[#5c524b]">{r.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
