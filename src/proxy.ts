import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the admin's Supabase session cookies fresh and sends visitors with no
 * session to the login page. This is only an optimistic check; every admin
 * page and action re-verifies with requireAdmin().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const path = request.nextUrl.pathname;
  // Weddings used to live at /admin/<slug>/...; they now live at /admin/weddings/<slug>/...
  const old = /^\/admin\/([a-z0-9]+(?:-[a-z0-9]+)*)(\/.*)?$/.exec(path);
  if (old && !["login", "weddings", "gifts"].includes(old[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin/weddings/${old[1]}${old[2] ?? ""}`;
    return NextResponse.redirect(url, 308);
  }

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && path !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
