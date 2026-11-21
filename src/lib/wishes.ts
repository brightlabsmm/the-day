import "server-only";
import { z } from "zod";
import { createSupabaseGuestClient } from "@/lib/supabase/server";

const WishSchema = z.object({
  author_name: z.string(),
  message: z.string(),
  created_at: z.string(),
  is_mine: z.boolean(),
});
export type Wish = z.infer<typeof WishSchema>;

/** Visible wishes for a guest holding a valid token. Empty if the token is not valid. */
export async function getWishes(slug: string, token: string): Promise<Wish[]> {
  const { data, error } = await createSupabaseGuestClient().rpc("get_wishes", {
    p_slug: slug,
    p_token: token,
  });
  if (error) throw new Error(`get_wishes failed: ${error.message}`);
  return z.array(WishSchema).parse(data ?? []);
}

export type PublicWish = Omit<Wish, "is_mine">;
const PublicWishSchema = WishSchema.omit({ is_mine: true });

/** Wishes for a wedding with an open (no guest link) wishes wall. */
export async function getPublicWishes(slug: string): Promise<PublicWish[]> {
  const { data, error } = await createSupabaseGuestClient().rpc("get_public_wishes", { p_slug: slug });
  if (error) throw new Error(`get_public_wishes failed: ${error.message}`);
  return z.array(PublicWishSchema).parse(data ?? []);
}
