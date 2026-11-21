import type { ReactNode } from "react";

export const metadata = { title: "THE DAY — Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-svh bg-ivory text-ink">{children}</div>;
}
