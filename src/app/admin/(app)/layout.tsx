import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions/auth";

/** Every signed-in admin page: a slim top bar (The Day, the admin's email, sign out) over the page. */
export default function AdminAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#e7dccb] bg-[#fbf8f3]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="text-[1.6rem] leading-none text-[#2f2925]" style={{ fontFamily: 'var(--font-script), "Great Vibes", cursive' }}>
              The Day
            </span>
            <span className="text-[0.65rem] font-medium tracking-[0.2em] text-[#8a7f75] uppercase">Admin</span>
          </Link>
          <Suspense fallback={null}>
            <Account />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8">{children}</main>
    </>
  );
}

async function Account() {
  const { user } = await requireAdmin();
  return (
    <form action={signOut} className="flex min-w-0 items-center gap-3">
      <span className="hidden truncate text-sm text-[#7a6f66] sm:inline">{user.email}</span>
      <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#5c524b] hover:bg-[#f3ebdf] hover:text-[#2f2925]">
        <LogOut className="size-4" aria-hidden />
        Sign out
      </button>
    </form>
  );
}
