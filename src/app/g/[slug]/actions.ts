"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { createSupabaseGuestClient } from "@/lib/supabase/server";

export type SignupState = {
  status: "idle" | "ok" | "error";
  error?: "name" | "contact" | "closed" | "busy" | "generic";
  name?: string;
  intention?: string;
  vipCode?: string | null;
};

const SignupInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  name: z.string().trim().min(1).max(80),
  contact: z.string().trim().min(3).max(120),
  intention: z.string().trim().max(160),
});

const COOLDOWN_COOKIE = "theday_gift_signup_at";

/**
 * E-Invitation sign-up. Same abuse controls as public wishes: a hidden
 * honeypot field, a short per-browser cooldown and a per-campaign limit in
 * the database.
 */
export async function submitGiftSignup(slug: string, _prev: SignupState, form: FormData): Promise<SignupState> {
  // Bots fill every field; pretend it worked.
  if (String(form.get("website") ?? "") !== "") return { status: "ok", name: "", vipCode: null };

  const parsed = SignupInput.safeParse({
    slug,
    name: form.get("name"),
    contact: form.get("contact"),
    intention: form.get("intention") ?? "",
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { status: "error", error: field === "name" ? "name" : field === "contact" ? "contact" : "generic" };
  }

  const jar = await cookies();
  if (jar.get(COOLDOWN_COOKIE)) return { status: "error", error: "busy" };

  const d = parsed.data;
  const { data, error } = await createSupabaseGuestClient().rpc("submit_gift_signup", {
    p_slug: d.slug,
    p_name: d.name,
    p_contact: d.contact,
    p_intention: d.intention,
  });
  const res = data as { ok?: boolean; error?: string; vip_code?: string | null } | null;
  if (error || !res || typeof res !== "object") return { status: "error", error: "generic" };
  if (!res.ok) {
    const map: Record<string, NonNullable<SignupState["error"]>> = {
      invalid_name: "name",
      invalid_contact: "contact",
      closed: "closed",
      busy: "busy",
    };
    return { status: "error", error: map[res.error ?? ""] ?? "generic" };
  }

  jar.set(COOLDOWN_COOKIE, "1", { maxAge: 30, httpOnly: true, sameSite: "lax", path: "/" });
  return { status: "ok", name: d.name, intention: d.intention, vipCode: res.vip_code ?? null };
}
