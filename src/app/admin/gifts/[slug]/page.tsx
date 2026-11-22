import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { I18nField, inputClass } from "@/components/admin/admin-nav";
import { GiftAdminNav } from "@/components/admin/gift-admin-nav";
import { CopyButton } from "@/components/admin/copy-button";
import { GIFT_ICONS, GIFT_KINDS, GIFT_VIEWS } from "@/lib/gift";
import { intentionsToText } from "@/lib/admin/gift-forms";
import { saveGiftCampaign, saveGiftItem } from "../../gift-actions";

export default function GiftCampaignPage(props: PageProps<"/admin/gifts/[slug]">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Campaign {...props} />
      </Suspense>
    </main>
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
  const { supabase } = await requireAdmin();
  const { data: c } = await supabase.from("gift_campaigns").select("*").eq("slug", slug).maybeSingle();
  if (!c) notFound();
  const { data: items } = await supabase.from("gift_items").select("*").eq("campaign_id", c.id).order("position");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${site}/g/${c.slug}`;

  return (
    <>
      <GiftAdminNav slug={c.slug} current="" />

      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-ink-soft">Link:</span> <code>{link}</code>
        <CopyButton text={link} label="Copy link" />
      </p>

      <form action={saveGiftCampaign} className="mt-6 space-y-5">
        <input type="hidden" name="slug" value={c.slug} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label-caps block">
            Status
            <select name="status" defaultValue={c.status} className={`${inputClass} mt-1`}>
              <option value="draft">Draft (only admins can open it)</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="label-caps block">
            Opens in view
            <select name="default_view" defaultValue={c.default_view} className={`${inputClass} mt-1`}>
              {GIFT_VIEWS.map((v) => (
                <option key={v} value={v}>
                  {VIEW_NAMES[v]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <I18nField name="title" label="Title" value={c.title} />
        <I18nField name="subtitle" label="Subtitle" value={c.subtitle} />
        <label className="label-caps block">
          Shop link (for “Redeem”, optional, https://…)
          <input name="shop_url" type="url" defaultValue={c.shop_url ?? ""} placeholder="https://" className={`${inputClass} mt-1`} />
        </label>

        <fieldset className="space-y-4 border border-navy/30 p-4">
          <legend className="label-caps px-1">E-Invitation sign-up</legend>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="invite_enabled" defaultChecked={c.invite_enabled} /> Show the sign-up form
          </label>
          <I18nField name="invite_title" label="Heading" value={c.invite_title} />
          <I18nField name="invite_text" label="Text" value={c.invite_text} multiline />
          <fieldset className="space-y-1">
            <legend className="label-caps">Choices for “What is your soul calling for?” (one per line, lines pair up)</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <textarea name="intentions_my" lang="my" rows={4} defaultValue={intentionsToText(c.invite_intentions, "my")} placeholder="မြန်မာ" className={inputClass} />
              <textarea name="intentions_en" lang="en" rows={4} defaultValue={intentionsToText(c.invite_intentions, "en")} placeholder="English" className={inputClass} />
            </div>
          </fieldset>
          <label className="label-caps block">
            VIP code shown after signing up (A–Z, 0–9, _ -)
            <input name="vip_code" defaultValue={c.vip_code ?? ""} maxLength={40} className={`${inputClass} mt-1 max-w-xs font-mono uppercase`} />
          </label>
        </fieldset>

        <button className="label-caps border border-navy bg-navy px-5 py-2 text-ivory">Save campaign</button>
      </form>

      <h2 className="font-display mt-12 text-2xl font-semibold">Gifts</h2>
      <p className="text-sm text-ink-soft">Twelve slots. A slot with no title is left off the page. The centre of the lotus and astrolabe opens the last gift.</p>

      <ol className="mt-6 space-y-6">
        {(items ?? []).map((g) => (
          <li key={g.id}>
            <details className="border border-navy/30 bg-white/40">
              <summary className="cursor-pointer px-4 py-3">
                <span className="label-caps">#{g.position}</span> {(g.title as { en?: string }).en || (g.title as { my?: string }).my || <span className="text-ink-soft">Empty slot</span>}
                {g.code && <code className="ml-2 text-sm text-ink-soft">{g.code}</code>}
              </summary>
              <form action={saveGiftItem} className="space-y-4 border-t border-navy/20 px-4 py-4">
                <input type="hidden" name="id" value={g.id} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="label-caps block">
                    Icon
                    <select name="icon" defaultValue={g.icon} className={`${inputClass} mt-1`}>
                      {GIFT_ICONS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="label-caps block sm:col-span-2">
                    Kind
                    <select name="kind" defaultValue={g.kind} className={`${inputClass} mt-1`}>
                      {GIFT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {KIND_HELP[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <I18nField name="category" label="Category" value={g.category} />
                <I18nField name="title" label="Title" value={g.title} />
                <I18nField name="description" label="Description" value={g.description} multiline />
                <I18nField name="detail_title" label="Detail title" value={g.detail_title} />
                <I18nField name="detail_text" label="Detail text" value={g.detail_text} multiline />
                <label className="label-caps block">
                  Code (optional)
                  <input name="code" defaultValue={g.code ?? ""} maxLength={40} className={`${inputClass} mt-1 max-w-xs font-mono uppercase`} />
                </label>
                <button className="label-caps border border-navy px-5 py-2">Save gift #{g.position}</button>
              </form>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
