"use server";

import { cookies } from "next/headers";
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
  error?: "name" | "message" | "closed" | "sent" | "busy" | "generic";
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
      busy: "busy",
    };
    return { status: "error", error: map[res.error ?? ""] ?? "generic" };
  }

  revalidatePath("/w/[slug]", "page");
  return { status: res.updated ? "updated" : "ok" };
}

const PublicWishInput = z.object({
  slug: Input.shape.slug,
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(500),
});

const COOLDOWN_COOKIE = "theday_wish_at";
const COOLDOWN_SECONDS = 30;

/**
 * Wish from a visitor with no guest link. Abuse controls: a hidden honeypot
 * field, a short per-browser cooldown, and a per-wedding rate limit in the
 * database. Admins can hide any wish afterwards.
 */
export async function submitPublicWish(slug: string, _prev: WishState, form: FormData): Promise<WishState> {
  // Bots fill every field; pretend it worked.
  if (String(form.get("website") ?? "") !== "") return { status: "ok" };

  const parsed = PublicWishInput.safeParse({ slug, name: form.get("name"), message: form.get("message") });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { status: "error", error: field === "name" ? "name" : field === "message" ? "message" : "generic" };
  }

  const jar = await cookies();
  if (jar.get(COOLDOWN_COOKIE)) return { status: "error", error: "busy" };

  const { data, error } = await createSupabaseGuestClient().rpc("submit_public_wish", {
    p_slug: parsed.data.slug,
    p_author_name: parsed.data.name,
    p_message: parsed.data.message,
  });
  const res = data as { ok?: boolean; error?: string } | null;
  if (error || !res || typeof res !== "object") return { status: "error", error: "generic" };
  if (!res.ok) {
    const map: Record<string, NonNullable<WishState["error"]>> = {
      invalid_name: "name",
      invalid_message: "message",
      closed: "closed",
      busy: "busy",
    };
    return { status: "error", error: map[res.error ?? ""] ?? "generic" };
  }

  jar.set(COOLDOWN_COOKIE, "1", { maxAge: COOLDOWN_SECONDS, httpOnly: true, sameSite: "lax", path: "/" });
  revalidatePath("/w/[slug]", "page");
  return { status: "ok" };
}

export type RsvpState = {
  status: "idle" | "ok" | "error";
  error?: "name" | "input" | "closed" | "busy" | "generic";
  attending?: boolean;
  updated?: boolean;
};

const RsvpInput = z.object({
  slug: Input.shape.slug,
  token: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(64).nullable(),
  name: z.string().trim().min(1).max(80),
  attending: z.enum(["yes", "no"]),
  party: z.coerce.number().int().min(1).max(10),
  note: z.string().trim().max(300),
});

/**
 * RSVP from anyone with the link. A guest with a personal link keeps one
 * reply they can change; others add a reply each time. Same abuse controls
 * as public wishes: honeypot, per-browser cooldown, per-wedding limit.
 */
export async function submitRsvp(slug: string, token: string, _prev: RsvpState, form: FormData): Promise<RsvpState> {
  if (String(form.get("website") ?? "") !== "") return { status: "ok", attending: false };

  const parsed = RsvpInput.safeParse({
    slug,
    token: token || null,
    name: form.get("name"),
    attending: form.get("attending"),
    party: form.get("party") || 1,
    note: form.get("note") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.path[0] === "name" ? "name" : "input" };
  }

  const jar = await cookies();
  if (jar.get("theday_rsvp_at")) return { status: "error", error: "busy" };

  const d = parsed.data;
  const { data, error } = await createSupabaseGuestClient().rpc("submit_rsvp", {
    p_slug: d.slug,
    p_token: d.token ?? "",
    p_name: d.name,
    p_attending: d.attending === "yes",
    p_party_size: d.attending === "yes" ? d.party : 1,
    p_note: d.note,
  });
  const res = data as { ok?: boolean; error?: string; updated?: boolean } | null;
  if (error || !res || typeof res !== "object") return { status: "error", error: "generic" };
  if (!res.ok) {
    const map: Record<string, NonNullable<RsvpState["error"]>> = {
      invalid_name: "name",
      invalid_input: "input",
      closed: "closed",
      busy: "busy",
    };
    return { status: "error", error: map[res.error ?? ""] ?? "generic" };
  }

  jar.set("theday_rsvp_at", "1", { maxAge: 20, httpOnly: true, sameSite: "lax", path: "/" });
  return { status: "ok", attending: d.attending === "yes", updated: !!res.updated };
}
