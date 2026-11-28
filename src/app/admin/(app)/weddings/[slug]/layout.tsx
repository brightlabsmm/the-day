import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getWedding, siteUrl } from "@/lib/admin/data";
import { TEMPLATES } from "@/lib/templates";
import { invitationTitle, occasionOf } from "@/lib/occasion";
import { SectionTabs, type Tab } from "@/components/admin/section-tabs";
import { CopyButton } from "@/components/admin/action-form";
import { Badge, StatusBadge, buttonClass } from "@/components/admin/ui";

const TABS: Tab[] = [
  { href: "", label: "Guests", icon: "guests" },
  { href: "/details", label: "Details", icon: "details" },
  { href: "/events", label: "Events", icon: "events" },
  { href: "/media", label: "Photos & music", icon: "media" },
  { href: "/rsvps", label: "RSVPs", icon: "rsvps" },
  { href: "/wishes", label: "Wishes", icon: "wishes" },
];

/** One wedding: its header (names, status, links) and section tabs, shared by every tab's page. */
export default function WeddingLayout({ children, params }: LayoutProps<"/admin/weddings/[slug]">) {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-[#7a6f66] hover:text-[#2f2925]">
        <ArrowLeft className="size-4" aria-hidden /> All invitations
      </Link>
      <Suspense fallback={<div className="h-[4.5rem]" />}>
        <WeddingHeader params={params} />
      </Suspense>
      <Suspense fallback={<div className="h-11 border-b border-[#e7dccb]" />}>
        <SectionTabs base="/admin/weddings" tabs={TABS} label="Wedding sections" />
      </Suspense>
      <div>{children}</div>
    </div>
  );
}

async function WeddingHeader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { wedding: w } = await getWedding(slug);
  const link = `${siteUrl()}/w/${w.slug}`;
  const design = TEMPLATES.find((t) => t.key === w.template_key)?.name ?? w.template_key;
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[2rem] leading-tight font-semibold">{invitationTitle(w, "en") || "Untitled"}</h1>
          <StatusBadge status={w.status} />
          {occasionOf(w.cover_text) === "birthday" && <Badge tone="gold">Birthday</Badge>}
        </div>
        <p className="mt-1 text-sm text-[#7a6f66]">
          /w/{w.slug} · {design} design
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={link} label="Copy link" />
        <a href={`/w/${w.slug}`} target="_blank" rel="noopener" className={buttonClass.secondary}>
          <ExternalLink className="size-3.5" aria-hidden /> Preview
        </a>
      </div>
    </header>
  );
}
