import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Gift, Heart, Plus } from "lucide-react";
import { invitationTitle, occasionOf } from "@/lib/occasion";
import { requireAdmin } from "@/lib/admin/auth";
import { pick } from "@/lib/admin/schemas";
import { createBirthday, createWedding } from "@/lib/admin/actions/weddings";
import { createGiftCampaign } from "@/lib/admin/actions/gifts";
import { TEMPLATES, templatesFor } from "@/lib/templates";
import { ActionForm } from "@/components/admin/action-form";
import { Badge, Empty, Field, Input, Loading, PageTitle, Select, StatusBadge } from "@/components/admin/ui";

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <PageTitle title="Invitations" description="Every wedding and gift invitation. Open one to edit it." />
      <Suspense fallback={<Loading />}>
        <Weddings />
        <GiftCampaigns />
      </Suspense>
    </div>
  );
}

async function Weddings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("weddings").select("slug, status, template_key, partner_one_name, partner_two_name, cover_text").order("created_at", { ascending: false });
  const weddings = data ?? [];
  const designs = Object.fromEntries(TEMPLATES.map((t) => [t.key, t.name]));

  return (
    <Section icon={<Heart className="size-4" aria-hidden />} title="Weddings & birthdays" count={weddings.length}>
      {weddings.length === 0 ? (
        <Empty>No weddings yet.</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weddings.map((w) => (
            <li key={w.slug}>
              <Tile
                href={`/admin/weddings/${w.slug}`}
                status={w.status}
                tag={occasionOf(w.cover_text) === "birthday" ? "Birthday" : undefined}
                meta={`/w/${w.slug} · ${designs[w.template_key] ?? w.template_key}`}
              >
                {invitationTitle(w, "en") || "Untitled"}
              </Tile>
            </li>
          ))}
        </ul>
      )}
      <NewItem label="New wedding">
        <ActionForm action={createWedding} submitLabel="Create wedding">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Partner one (English)">
              <Input name="partner_one" required maxLength={80} />
            </Field>
            <Field label="Partner two (English)">
              <Input name="partner_two" required maxLength={80} />
            </Field>
            <Field label="Design">
              <Select name="template_key" defaultValue="classic">
                {templatesFor("wedding").map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Link code (optional)" hint="Empty gives a random code.">
              <Input name="slug" maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="aung-and-may" />
            </Field>
          </div>
          <p className="mt-3 text-xs text-[#8a7f75]">It starts as a draft; fill in the rest on the next page.</p>
        </ActionForm>
      </NewItem>
      <NewItem label="New birthday">
        <ActionForm action={createBirthday} submitLabel="Create birthday">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Name (English)">
              <Input name="name" required maxLength={80} placeholder="Sacha" />
            </Field>
            <Field label="Which birthday" hint="e.g. 1st, 30th; optional.">
              <Input name="age" maxLength={30} placeholder="1st" />
            </Field>
            <Field label="Design">
              <Select name="template_key" defaultValue="bloom">
                {templatesFor("birthday").map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Link code (optional)" hint="Empty gives a random code.">
              <Input name="slug" maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="sacha-turns-one" />
            </Field>
          </div>
          <p className="mt-3 text-xs text-[#8a7f75]">It starts as a draft; add the Burmese name, the party and photos on the next pages.</p>
        </ActionForm>
      </NewItem>
    </Section>
  );
}

async function GiftCampaigns() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("gift_campaigns").select("slug, status, title").order("created_at", { ascending: false });
  const campaigns = data ?? [];

  return (
    <Section icon={<Gift className="size-4" aria-hidden />} title="Gift invitations" count={campaigns.length}>
      {campaigns.length === 0 ? (
        <Empty>No gift invitations yet.</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <li key={c.slug}>
              <Tile href={`/admin/gifts/${c.slug}`} status={c.status} meta={`/g/${c.slug}`}>
                {pick(c.title, "Untitled")}
              </Tile>
            </li>
          ))}
        </ul>
      )}
      <NewItem label="New gift invitation">
        <ActionForm action={createGiftCampaign} submitLabel="Create gift invitation">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title (English)">
              <Input name="title" required maxLength={120} />
            </Field>
            <Field label="Link code (optional)" hint="Empty gives a random code.">
              <Input name="slug" maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </Field>
          </div>
        </ActionForm>
      </NewItem>
    </Section>
  );
}

function Section({ icon, title, count, children }: { icon: ReactNode; title: string; count: number; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-[#f3ebdf] text-[#8a6a2a]">{icon}</span>
        {title}
        <span className="text-sm font-normal text-[#8a7f75]">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function Tile({ href, status, meta, tag, children }: { href: string; status: string; meta: string; tag?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-[#e7dccb] bg-white p-4 shadow-[0_1px_2px_rgba(60,40,20,0.05)] transition hover:border-[#c9a96a] hover:shadow-md"
    >
      <div className="min-w-0">
        <p className="font-display truncate text-xl leading-snug font-semibold">{children}</p>
        <p className="mt-1 truncate text-xs text-[#8a7f75]">{meta}</p>
        <div className="mt-3 flex gap-1.5">
          <StatusBadge status={status} />
          {tag && <Badge tone="gold">{tag}</Badge>}
        </div>
      </div>
      <ChevronRight className="mt-1 size-4 shrink-0 text-[#b8a894] transition group-hover:translate-x-0.5 group-hover:text-[#8a6a2a]" aria-hidden />
    </Link>
  );
}

function NewItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-dashed border-[#d6c7b1] bg-white/60 open:border-solid open:bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[#5c524b] hover:text-[#2f2925]">
        <Plus className="size-4 transition group-open:rotate-45" aria-hidden />
        {label}
      </summary>
      <div className="border-t border-[#efe6d8] px-4 py-4">{children}</div>
    </details>
  );
}
