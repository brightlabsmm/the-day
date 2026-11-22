import "server-only";
import { createSupabaseGuestClient } from "@/lib/supabase/server";
import { parseGiftCampaign, type GiftCampaign } from "@/lib/gift";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Loads a published gift campaign (or a draft, for an admin). */
export async function getGiftCampaign(slug: string): Promise<GiftCampaign | null> {
  if (!SLUG_RE.test(slug) || slug.length > 60) return null;
  const { data, error } = await createSupabaseGuestClient().rpc("get_gift_campaign", { p_slug: slug });
  if (error) throw new Error(`get_gift_campaign failed: ${error.message}`);
  return parseGiftCampaign(data);
}
