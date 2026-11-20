"use server";

import { z } from "zod";
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
