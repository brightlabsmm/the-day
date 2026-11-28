import type { ReactNode } from "react";
import "./admin.css";

export const metadata = { title: "The Day — Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin min-h-svh bg-[#f6f1ea] font-label text-[#2f2925] antialiased">{children}</div>;
}
