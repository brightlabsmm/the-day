"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { CalendarDays, Gift, Image as ImageIcon, MailCheck, MessageSquareHeart, PenLine, Users, type LucideIcon } from "lucide-react";

const ICONS = {
  guests: Users,
  details: PenLine,
  events: CalendarDays,
  media: ImageIcon,
  rsvps: MailCheck,
  wishes: MessageSquareHeart,
  gifts: Gift,
} satisfies Record<string, LucideIcon>;

export type Tab = { href: string; label: string; icon: keyof typeof ICONS };

/** The section tabs under a wedding's or campaign's header. They scroll sideways on phones. */
export function SectionTabs({ base, tabs, label }: { base: string; tabs: Tab[]; label: string }) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const root = `${base}/${slug}`;
  return (
    <nav aria-label={label} className="admin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-[#e7dccb]">
        {tabs.map((t) => {
          const href = `${root}${t.href}`;
          const current = pathname === href;
          const Icon = ICONS[t.icon];
          return (
            <li key={t.href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  current ? "border-[#b8913f] text-[#2f2925]" : "border-transparent text-[#7a6f66] hover:text-[#2f2925]"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
