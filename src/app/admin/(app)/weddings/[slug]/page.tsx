import { Suspense } from "react";
import { Trash2 } from "lucide-react";
import { getWedding, siteUrl, formatWhen } from "@/lib/admin/data";
import { addGuest, deleteGuest, setGuestTable } from "@/lib/admin/actions/guests";
import { ActionForm, CopyButton, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Empty, Field, Input, Loading, Stats } from "@/components/admin/ui";

export default function GuestsPage(props: PageProps<"/admin/weddings/[slug]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Guests {...props} />
    </Suspense>
  );
}

async function Guests({ params }: PageProps<"/admin/weddings/[slug]">) {
  const { slug } = await params;
  const { supabase, wedding: w } = await getWedding(slug);
  const { data } = await supabase
    .from("guests")
    .select("id, display_name, display_name_my, group_name, table_name, token, opened_at")
    .eq("wedding_id", w.id)
    .order("created_at");
  const guests = data ?? [];
  const opened = guests.filter((g) => g.opened_at).length;
  const seated = guests.filter((g) => g.table_name).length;
  const site = siteUrl();

  return (
    <div className="space-y-6">
      <Stats
        items={[
          { label: "Guests", value: guests.length },
          { label: "Opened", value: opened },
          { label: "Not opened yet", value: guests.length - opened },
          { label: "Have a table", value: seated },
        ]}
      />

      <Card title="Add a guest" description="Each guest gets a personal link with their name on the invitation.">
        <ActionForm action={addGuest} resetOnSuccess submitLabel="Add guest">
          <input type="hidden" name="slug" value={w.slug} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Name (English)">
              <Input name="name" required maxLength={80} placeholder="U Aung & family" />
            </Field>
            <Field label="Name (Burmese)">
              <Input name="nameMy" maxLength={80} lang="my" placeholder="ဦးအောင် နှင့် မိသားစု" />
            </Field>
            <Field label="Group">
              <Input name="group" maxLength={60} placeholder="Bride's family" />
            </Field>
            <Field label="Table" hint="Optional, for Find your seat.">
              <Input name="table" maxLength={40} placeholder="Table 4" />
            </Field>
          </div>
        </ActionForm>
      </Card>

      <Card title={`Guest list (${guests.length})`} className="overflow-hidden">
        {guests.length === 0 ? (
          <Empty>No guests yet. Add the first one above.</Empty>
        ) : (
          <ul className="-mx-5 -my-5 divide-y divide-[#efe6d8]">
            {guests.map((g) => {
              const link = (lang: "my" | "en") => `${site}/w/${w.slug}?g=${g.token}&lang=${lang}`;
              return (
                <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                  <div className="min-w-[12rem] flex-1">
                    <p className="font-medium">
                      {g.display_name}
                      {g.display_name_my && (
                        <span lang="my" className="font-normal text-[#7a6f66]">
                          {" "}
                          · {g.display_name_my}
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {g.group_name && <Badge>{g.group_name}</Badge>}
                      {g.opened_at ? <Badge tone="yes">Opened {formatWhen(g.opened_at, w.timezone)}</Badge> : <Badge tone="draft">Not opened</Badge>}
                    </div>
                  </div>
                  <ActionForm action={setGuestTable} className="flex items-center gap-1.5">
                    <input type="hidden" name="slug" value={w.slug} />
                    <input type="hidden" name="id" value={g.id} />
                    <Input name="table" defaultValue={g.table_name ?? ""} maxLength={40} placeholder="Table" aria-label={`Table for ${g.display_name}`} className="w-28 py-1.5 text-sm" />
                    <SubmitButton variant="secondary">Save</SubmitButton>
                  </ActionForm>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CopyButton text={link("my")} label="မြန်မာ link" />
                    <CopyButton text={link("en")} label="EN link" />
                    <ActionForm action={deleteGuest} confirm={`Delete ${g.display_name}? Their personal link will stop working.`}>
                      <input type="hidden" name="slug" value={w.slug} />
                      <input type="hidden" name="id" value={g.id} />
                      <SubmitButton variant="danger" aria-label={`Delete ${g.display_name}`} title="Delete guest">
                        <Trash2 className="size-4" aria-hidden />
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
