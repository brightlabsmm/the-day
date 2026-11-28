import { Suspense } from "react";
import { Trash2 } from "lucide-react";
import { getCampaign, formatWhen } from "@/lib/admin/data";
import { deleteGiftSignup } from "@/lib/admin/actions/gifts";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Empty, Loading, Notice } from "@/components/admin/ui";

export default function GiftSignupsPage(props: PageProps<"/admin/gifts/[slug]/signups">) {
  return (
    <Suspense fallback={<Loading />}>
      <Signups {...props} />
    </Suspense>
  );
}

async function Signups({ params }: PageProps<"/admin/gifts/[slug]/signups">) {
  const { slug } = await params;
  const { supabase, campaign: c } = await getCampaign(slug);
  const { data } = await supabase
    .from("gift_signups")
    .select("id, name, contact, intention, created_at")
    .eq("campaign_id", c.id)
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  return (
    <div className="space-y-6">
      {!c.invite_enabled && <Notice>The sign-up form is switched off for this campaign.</Notice>}
      <Card title={`Sign-ups (${rows.length})`}>
        {rows.length === 0 ? (
          <Empty>No sign-ups yet.</Empty>
        ) : (
          <ul className="-mx-5 -my-5 divide-y divide-[#efe6d8]">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm break-all text-[#5c524b]">{r.contact}</p>
                  {r.intention && <p className="mt-1 text-sm text-[#7a6f66]">{r.intention}</p>}
                </div>
                <p className="text-xs text-[#8a7f75]">{formatWhen(r.created_at)}</p>
                <ActionForm action={deleteGiftSignup} confirm={`Delete ${r.name}'s sign-up?`}>
                  <input type="hidden" name="id" value={r.id} />
                  <SubmitButton variant="danger" aria-label={`Delete ${r.name}`} title="Delete">
                    <Trash2 className="size-4" aria-hidden />
                  </SubmitButton>
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
