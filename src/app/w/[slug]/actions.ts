"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseGuestClient } from "@/lib/supabase/server";

const Input = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  token: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(64),
});

/**
 * Records the first time a guest opens their invitation. Called when they tap
 * the seal rather than on page load, so link-preview bots (Messenger, Viber,
 * Telegram) fetching the URL don't count as an open.
 */
export async function markOpened(slug: string, token: string): Promise<void> {
  const parsed = Input.safeParse({ slug, token });
  if (!parsed.success) return;
  await createSupabaseGuestClient().rpc("mark_invitation_opened", {
    p_slug: parsed.data.slug,
    p_token: parsed.data.token,
  });
}

export type WishState = {
  status: "idle" | "ok" | "updated" | "error";
  error?: "name" | "message" | "closed" | "sent" | "generic";
};

const WishInput = Input.extend({
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(500),
});

/** Saves the guest's single wish (creates it, or edits it if the couple allows). */
export async function submitWish(slug: string, token: string, _prev: WishState, form: FormData): Promise<WishState> {
  const parsed = WishInput.safeParse({
    slug,
    token,
    name: form.get("name"),
    message: form.get("message"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { status: "error", error: field === "name" ? "name" : field === "message" ? "message" : "generic" };
  }

  const { data, error } = await createSupabaseGuestClient().rpc("submit_wish", {
    p_slug: parsed.data.slug,
    p_token: parsed.data.token,
    p_author_name: parsed.data.name,
    p_message: parsed.data.message,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return { status: "error", error: "generic" };

  const res = data as { ok?: boolean; error?: string; updated?: boolean };
  if (!res.ok) {
    const map: Record<string, NonNullable<WishState["error"]>> = {
      invalid_name: "name",
      invalid_message: "message",
      closed: "closed",
      already_sent: "sent",
    };
    return { status: "error", error: map[res.error ?? ""] ?? "generic" };
  }

  revalidatePath("/w/[slug]", "page");
  return { status: res.updated ? "updated" : "ok" };
}
