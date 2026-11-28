import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCampaign, siteUrl } from "@/lib/admin/data";
import { pick } from "@/lib/admin/schemas";
import { SectionTabs, type Tab } from "@/components/admin/section-tabs";
import { CopyButton } from "@/components/admin/action-form";
import { StatusBadge, buttonClass } from "@/components/admin/ui";

const TABS: Tab[] = [
  { href: "", label: "Campaign & gifts", icon: "gifts" },
  { href: "/signups", label: "Sign-ups", icon: "guests" },
];

/** One gift invitation: its header and tabs, shared by both of its pages. */
export default function CampaignLayout({ children, params }: LayoutProps<"/admin/gifts/[slug]">) {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-[#7a6f66] hover:text-[#2f2925]">
        <ArrowLeft className="size-4" aria-hidden /> All invitations
      </Link>
      <Suspense fallback={<div className="h-[4.5rem]" />}>
        <CampaignHeader params={params} />
      </Suspense>
      <Suspense fallback={<div className="h-11 border-b border-[#e7dccb]" />}>
        <SectionTabs base="/admin/gifts" tabs={TABS} label="Gift invitation sections" />
      </Suspense>
      <div>{children}</div>
    </div>
  );
}

async function CampaignHeader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { campaign: c } = await getCampaign(slug);
  const link = `${siteUrl()}/g/${c.slug}`;
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[2rem] leading-tight font-semibold">{pick(c.title, "Untitled")}</h1>
          <StatusBadge status={c.status} />
        </div>
        <p className="mt-1 text-sm text-[#7a6f66]">Gift invitation · /g/{c.slug}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={link} label="Copy link" />
        <a href={`/g/${c.slug}`} target="_blank" rel="noopener" className={buttonClass.secondary}>
          <ExternalLink className="size-3.5" aria-hidden /> Preview
        </a>
      </div>
    </header>
  );
}
