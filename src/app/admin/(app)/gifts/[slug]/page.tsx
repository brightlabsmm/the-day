import { Suspense } from "react";
import { getCampaign } from "@/lib/admin/data";
import { pick } from "@/lib/admin/schemas";
import { intentionsToText } from "@/lib/admin/gift-forms";
import { saveGiftCampaign, saveGiftItem } from "@/lib/admin/actions/gifts";
import { GIFT_ICONS, GIFT_KINDS, GIFT_VIEWS } from "@/lib/gift";
import { ActionForm } from "@/components/admin/action-form";
import { Badge, BilingualField, Card, Field, Input, Loading, Select, Textarea, Toggle } from "@/components/admin/ui";

export default function GiftCampaignPage(props: PageProps<"/admin/gifts/[slug]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Campaign {...props} />
    </Suspense>
  );
}

const VIEW_NAMES: Record<(typeof GIFT_VIEWS)[number], string> = { lotus: "Lotus petals", astrolabe: "Astrolabe", tarot: "Oracle cards" };
const KIND_HELP: Record<(typeof GIFT_KINDS)[number], string> = {
  voucher: "Voucher — just the text and code",
  audio: "Audio — a play-tone button; detail title = track name, detail text = note",
  book: "Book — a quoted excerpt; detail text = quote, detail title = source",
  oracle: "Oracle — a card to flip; detail title = button text, detail text = message",
};

async function Campaign({ params }: PageProps<"/admin/gifts/[slug]">) {
  const { slug } = await params;
  const { supabase, campaign: c } = await getCampaign(slug);
  const { data: items } = await supabase.from("gift_items").select("*").eq("campaign_id", c.id).order("position");

  return (
    <div className="space-y-6">
      <Card title="Campaign" description="What the gift page says, and how it opens.">
        <ActionForm action={saveGiftCampaign} submitLabel="Save campaign">
          <input type="hidden" name="slug" value={c.slug} />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <Select name="status" defaultValue={c.status}>
                  <option value="draft">Draft — only admins can open it</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Opens in view">
                <Select name="default_view" defaultValue={c.default_view}>
                  {GIFT_VIEWS.map((v) => (
                    <option key={v} value={v}>
                      {VIEW_NAMES[v]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <BilingualField name="title" label="Title" value={c.title} />
            <BilingualField name="subtitle" label="Subtitle" value={c.subtitle} />
            <Field label="Shop link (optional)" hint="Where “Redeem” goes. Must start with https://">
              <Input name="shop_url" type="url" defaultValue={c.shop_url ?? ""} placeholder="https://" />
            </Field>

            <div className="space-y-4 rounded-xl bg-[#faf6f0] p-4">
              <div className="-my-3">
                <Toggle name="invite_enabled" defaultChecked={c.invite_enabled} label="E-Invitation sign-up form" hint="Visitors leave a name and contact; they appear on the Sign-ups tab." />
              </div>
              <BilingualField name="invite_title" label="Heading" value={c.invite_title} />
              <BilingualField name="invite_text" label="Text" value={c.invite_text} multiline />
              <fieldset>
                <legend className="mb-1.5 text-[0.8rem] font-medium text-[#5c524b]">Choices for “What is your soul calling for?”</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Textarea name="intentions_en" lang="en" rows={4} defaultValue={intentionsToText(c.invite_intentions, "en")} placeholder="English" aria-label="Choices (English)" />
                  <Textarea name="intentions_my" lang="my" rows={4} defaultValue={intentionsToText(c.invite_intentions, "my")} placeholder="မြန်မာ" aria-label="Choices (Burmese)" />
                </div>
                <p className="mt-1 text-xs text-[#8a7f75]">One per line; the English and Burmese lines pair up. At most 8.</p>
              </fieldset>
              <Field label="VIP code shown after signing up" hint="A–Z, 0–9, _ and -.">
                <Input name="vip_code" defaultValue={c.vip_code ?? ""} maxLength={40} className="max-w-xs font-mono uppercase" />
              </Field>
            </div>
          </div>
        </ActionForm>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Gifts</h2>
          <p className="text-sm text-[#7a6f66]">Twelve slots. A slot with no title is left off the page. The centre of the lotus and astrolabe opens the last gift.</p>
        </div>
        <ol className="space-y-2">
          {(items ?? []).map((g) => {
            const title = pick(g.title);
            return (
              <li key={g.id}>
                <details className="group rounded-xl border border-[#e7dccb] bg-white">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f3ebdf] text-xs font-semibold text-[#8a6a2a]">{g.position}</span>
                    <span className={`min-w-0 flex-1 truncate ${title ? "font-medium" : "text-[#8a7f75]"}`}>{title || "Empty slot"}</span>
                    {g.code && <Badge tone="gold">{g.code}</Badge>}
                    <span className="text-sm font-medium text-[#8a6a2a] group-open:hidden">Edit</span>
                    <span className="hidden text-sm font-medium text-[#8a6a2a] group-open:inline">Close</span>
                  </summary>
                  <div className="border-t border-[#efe6d8] px-4 py-4">
                    <ActionForm action={saveGiftItem} submitLabel={`Save gift ${g.position}`}>
                      <input type="hidden" name="id" value={g.id} />
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <Field label="Icon">
                            <Select name="icon" defaultValue={g.icon}>
                              {GIFT_ICONS.map((i) => (
                                <option key={i} value={i}>
                                  {i}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Kind" className="sm:col-span-2">
                            <Select name="kind" defaultValue={g.kind}>
                              {GIFT_KINDS.map((k) => (
                                <option key={k} value={k}>
                                  {KIND_HELP[k]}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                        <BilingualField name="category" label="Category" value={g.category} />
                        <BilingualField name="title" label="Title" value={g.title} />
                        <BilingualField name="description" label="Description" value={g.description} multiline />
                        <BilingualField name="detail_title" label="Detail title" value={g.detail_title} />
                        <BilingualField name="detail_text" label="Detail text" value={g.detail_text} multiline />
                        <Field label="Code (optional)">
                          <Input name="code" defaultValue={g.code ?? ""} maxLength={40} className="max-w-xs font-mono uppercase" />
                        </Field>
                      </div>
                    </ActionForm>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
