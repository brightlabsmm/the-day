import { Suspense } from "react";
import { getWedding } from "@/lib/admin/data";
import { colorsToText, faqToText, storyToText, tipsToText } from "@/lib/admin/forms";
import { saveCouple, saveExtras, saveHonoree, saveSettings, saveWording } from "@/lib/admin/actions/details";
import { templatesFor } from "@/lib/templates";
import { ageValue, occasionOf } from "@/lib/occasion";
import { ActionForm } from "@/components/admin/action-form";
import { BilingualField, Card, Field, Input, Loading, Select, Textarea, Toggle } from "@/components/admin/ui";

export default function DetailsPage(props: PageProps<"/admin/weddings/[slug]/details">) {
  return (
    <Suspense fallback={<Loading />}>
      <Details {...props} />
    </Suspense>
  );
}

type L = { my?: string; en?: string };
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const list = <T,>(v: unknown) => (Array.isArray(v) ? v : []) as T[];

async function Details({ params }: PageProps<"/admin/weddings/[slug]/details">) {
  const { slug } = await params;
  const { wedding: w } = await getWedding(slug);
  const hidden = <input type="hidden" name="slug" value={w.slug} />;
  const family = obj(w.family);
  const cover = obj(w.cover_text);
  const story = list<{ label?: L; title?: L; text?: L }>(w.story);
  const faq = list<{ q?: L; a?: L }>(w.faq);
  const tips = list<{ title?: L; text?: L }>(w.good_to_know);
  const dress = obj(w.dress_code) as { text?: L; colors?: { hex: string; name?: L }[] };
  const birthday = occasionOf(w.cover_text) === "birthday";

  return (
    <div className="grid gap-6">
      <Card title="Design & visibility" description="Which design guests see, whether the invitation is live, and its optional sections.">
        <ActionForm action={saveSettings} submitLabel="Save">
          {hidden}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page design" hint={<>See every design at <a href="/showcase" target="_blank" className="underline">/showcase</a>.</>}>
              <Select name="template_key" defaultValue={w.template_key}>
                {templatesFor(birthday ? "birthday" : "wedding").map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name} — {t.mood}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={w.status}>
                <option value="draft">Draft — only admins can open it</option>
                <option value="published">Published — guests can open it</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 divide-y divide-[#efe6d8] border-t border-[#efe6d8]">
            <Toggle name="rsvp_enabled" defaultChecked={w.rsvp_enabled} label="RSVP form" hint="Replies appear on the RSVPs tab." />
            {!birthday && <Toggle name="seating_enabled" defaultChecked={w.seating_enabled} label="Find your seat" hint="Guests search their name; set tables on the Guests tab." />}
            <Toggle name="wishes_enabled" defaultChecked={w.wishes_enabled} label="Guests can leave wishes" />
            <Toggle name="wishes_editable" defaultChecked={w.wishes_editable} label="Guests can edit their wish" />
            <Toggle name="public_wishes" defaultChecked={w.public_wishes} label="Open wishes wall" hint="Anyone with the link can read and add wishes, without a personal guest link." />
          </div>
        </ActionForm>
      </Card>

      {birthday ? (
      <Card title="Birthday" description="Whose birthday it is and which one, in both languages.">
        <ActionForm action={saveHonoree} submitLabel="Save">
          {hidden}
          <div className="space-y-4">
            <BilingualField name="partner_one_name" label="Name" value={w.partner_one_name} />
            <BilingualField name="age" label="Which birthday" hint="Shown before “Birthday”, e.g. 1st → “1st Birthday”, ပထမ → “ပထမ မွေးနေ့”. Leave empty for just “Birthday”." value={ageValue(w.cover_text)} />
            <Field label="RSVP phone (optional)" hint="Shown on the card as “RSVP at …”, like the printed card. Guests can tap it to call.">
              <Input name="rsvp_contact" maxLength={40} defaultValue={typeof cover.rsvp_contact === "string" ? cover.rsvp_contact : ""} placeholder="+95 9 123 456 789" className="max-w-72" />
            </Field>
            <Field label="Initial" hint="Optional; one or two letters for the menu bar.">
              <Input name="monogram" maxLength={12} defaultValue={w.monogram ?? ""} className="max-w-40" />
            </Field>
          </div>
        </ActionForm>
      </Card>
      ) : (
      <Card title="The couple" description="Names as they appear on the invitation, in both languages.">
        <ActionForm action={saveCouple} submitLabel="Save">
          {hidden}
          <div className="space-y-4">
            <BilingualField name="partner_one_name" label="Partner one" value={w.partner_one_name} />
            <BilingualField name="partner_two_name" label="Partner two" value={w.partner_two_name} />
            <Field label="Monogram" hint="Up to 12 characters, e.g. T&M.">
              <Input name="monogram" maxLength={12} defaultValue={w.monogram ?? ""} className="max-w-40" />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              {(["partner_one", "partner_two"] as const).map((side, n) => {
                const f = obj(family[side]);
                return (
                  <div key={side} className="space-y-3 rounded-xl bg-[#faf6f0] p-4">
                    <p className="text-sm font-semibold">Partner {n + 1}&rsquo;s family (optional)</p>
                    <BilingualField name={`${side}_lineage`} label="Family lineage" value={f.lineage} multiline />
                    <Field label="Credentials" hint="e.g. B.E.(Civil)">
                      <Input name={`${side}_credentials`} maxLength={60} defaultValue={typeof f.credentials === "string" ? f.credentials : ""} />
                    </Field>
                  </div>
                );
              })}
            </div>
          </div>
        </ActionForm>
      </Card>
      )}

      <Card title="Wording" description="The invitation's own words. Leave the cover lines empty to use the design's defaults.">
        <ActionForm action={saveWording} submitLabel="Save">
          {hidden}
          <div className="space-y-4">
            <BilingualField name="tagline" label="Tagline" value={w.tagline} />
            <BilingualField name="invitation_text" label="Invitation message" value={w.invitation_text} multiline rows={4} />
            <BilingualField name="note" label="Note on the details card" value={w.note} multiline />
            <BilingualField name="closing_quote" label="Closing quote" value={w.closing_quote} multiline />
            <div className="space-y-4 rounded-xl bg-[#faf6f0] p-4">
              <p className="text-sm font-semibold">Cover</p>
              <BilingualField name="cover_corner_left" label="Top-left label" hint="One line per row." value={cover.corner_left} multiline rows={2} />
              <BilingualField name="cover_corner_right" label="Top-right label" hint="One line per row." value={cover.corner_right} multiline rows={2} />
              <BilingualField name="cover_script" label="Script line under the monogram" value={cover.script} />
              <BilingualField name="cover_footer" label="Footer line" value={cover.footer} />
            </div>
          </div>
        </ActionForm>
      </Card>

      <Card title="Story, dress code, FAQ & tips" description="Shown by the newer designs. Separate items with a blank line; English and Burmese items pair up by position.">
        <ActionForm action={saveExtras} submitLabel="Save">
          {hidden}
          <div className="space-y-5">
            <Pair
              label="Our story"
              hint="Each item: first line the label (e.g. WINTER 2020), second the title, then the text."
              name="story"
              rows={8}
              en={storyToText(story, "en")}
              my={storyToText(story, "my")}
            />
            <BilingualField name="dress_text" label="Dress code message" value={dress.text} multiline />
            <Pair
              label="Dress code colours"
              hint="One per line: a hex colour, then its name, e.g. #5e1a27 Burgundy."
              name="colors"
              rows={4}
              en={colorsToText(dress.colors ?? [], "en")}
              my={colorsToText(dress.colors ?? [], "my")}
              placeholder={{ en: "#5e1a27 Burgundy", my: "#5e1a27 ဘာဂန်ဒီ" }}
            />
            <Pair label="FAQ" hint="Each item: first line the question, then the answer." name="faq" rows={8} en={faqToText(faq, "en")} my={faqToText(faq, "my")} />
            <Pair
              label="Good to know"
              hint="Parking, transport, weather, children… Each item: first line the title, then the text."
              name="tips"
              rows={6}
              en={tipsToText(tips, "en")}
              my={tipsToText(tips, "my")}
            />
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}

/** Two plain-text boxes, English and Burmese, for a list typed as text. */
function Pair({ label, hint, name, rows, en, my, placeholder }: { label: string; hint: string; name: string; rows: number; en: string; my: string; placeholder?: { en: string; my: string } }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[0.8rem] font-medium text-[#5c524b]">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <Textarea name={`${name}_en`} rows={rows} defaultValue={en} placeholder={placeholder?.en ?? "English"} aria-label={`${label} (English)`} className="font-mono text-[0.85rem]" />
        <Textarea name={`${name}_my`} lang="my" rows={rows} defaultValue={my} placeholder={placeholder?.my ?? "မြန်မာ"} aria-label={`${label} (Burmese)`} className="text-[0.9rem]" />
      </div>
      <p className="mt-1 text-xs text-[#8a7f75]">{hint}</p>
    </fieldset>
  );
}
