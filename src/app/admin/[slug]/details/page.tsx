import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav, I18nField, inputClass } from "@/components/admin/admin-nav";
import { TEMPLATES } from "@/lib/templates";
import { colorsToText, faqToText, storyToText } from "@/lib/admin/forms";
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
        <label className="label-caps block">
          Page design
          <select name="template_key" defaultValue={w.template_key} className={`${inputClass} mt-1 max-w-sm`}>
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name} — {t.mood}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-sm normal-case tracking-normal text-ink-soft">
            See them all at <a href="/showcase" target="_blank" className="underline">/showcase</a>.
          </span>
        </label>
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
        <fieldset className="space-y-3 border border-navy/20 p-3">
          <legend className="label-caps px-1">Cover wording (leave empty for the defaults)</legend>
          {(() => {
            const c = (w.cover_text ?? {}) as Record<string, unknown>;
            return (
              <>
                <I18nField name="cover_corner_left" label="Top-left label (one line per row)" value={c.corner_left} multiline />
                <I18nField name="cover_corner_right" label="Top-right label (one line per row)" value={c.corner_right} multiline />
                <I18nField name="cover_script" label="Script line under the monogram" value={c.script} />
                <I18nField name="cover_footer" label="Footer line" value={c.footer} />
              </>
            );
          })()}
        </fieldset>
        <fieldset className="space-y-3 border border-navy/20 p-3">
          <legend className="label-caps px-1">Our story, dress code and FAQ (shown by the newer page designs)</legend>
          {(() => {
            type L = { my?: string; en?: string };
            const story = (Array.isArray(w.story) ? w.story : []) as { label?: L; title?: L; text?: L }[];
            const faq = (Array.isArray(w.faq) ? w.faq : []) as { q?: L; a?: L }[];
            const dress = (w.dress_code ?? {}) as { text?: L; colors?: { hex: string; name?: L }[] };
            const area = "block w-full border border-navy/40 bg-white/70 px-3 py-2 font-mono text-sm outline-none focus:border-gold";
            return (
              <>
                <p className="text-sm text-ink-soft">
                  Separate items with a blank line. Story: first line is the label (e.g. WINTER 2020), second the title,
                  then the text. FAQ: first line is the question, then the answer. English and Burmese items line up by
                  position.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea name="story_en" rows={8} placeholder="Story (English)" defaultValue={storyToText(story, "en")} className={area} />
                  <textarea name="story_my" rows={8} lang="my" placeholder="ဇာတ်လမ်း (မြန်မာ)" defaultValue={storyToText(story, "my")} className={area} />
                </div>
                <I18nField name="dress_text" label="Dress code message" value={dress.text} multiline />
                <p className="text-sm text-ink-soft">Dress code colours: one per line, as a hex colour then its name, e.g. #5e1a27 Burgundy</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea name="colors_en" rows={4} placeholder="#5e1a27 Burgundy" defaultValue={colorsToText(dress.colors ?? [], "en")} className={area} />
                  <textarea name="colors_my" rows={4} lang="my" placeholder="#5e1a27 ဘာဂန်ဒီ" defaultValue={colorsToText(dress.colors ?? [], "my")} className={area} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea name="faq_en" rows={8} placeholder="FAQ (English)" defaultValue={faqToText(faq, "en")} className={area} />
                  <textarea name="faq_my" rows={8} lang="my" placeholder="မေးလေ့ရှိသည်များ (မြန်မာ)" defaultValue={faqToText(faq, "my")} className={area} />
                </div>
              </>
            );
          })()}
        </fieldset>
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
          <label className="block">
            <input type="checkbox" name="rsvp_enabled" defaultChecked={w.rsvp_enabled} /> Show the RSVP form (replies appear on the RSVPs tab)
          </label>
          <label className="block">
            <input type="checkbox" name="public_wishes" defaultChecked={w.public_wishes} /> Open wishes wall: anyone with the
            link can read and add wishes (no personal guest link needed)
          </label>
        </fieldset>
        <button className="label-caps border border-navy bg-navy px-6 py-2.5 text-ivory">Save details</button>
      </form>
    </>
  );
}
