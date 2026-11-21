import "server-only";
import { z } from "zod";
import { createSupabaseGuestClient } from "@/lib/supabase/server";

const i18n = z.object({ my: z.string().optional(), en: z.string().optional() }).catchall(z.unknown());

const InvitationSchema = z.object({
  wedding: z.object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(["draft", "published"]),
    template_key: z.string(),
    partner_one_name: i18n,
    partner_two_name: i18n,
    monogram: z.string().nullable(),
    tagline: i18n,
    invitation_text: i18n,
    family: z.record(z.string(), z.unknown()),
    note: i18n,
    closing_quote: i18n,
    cover_text: z.record(z.string(), z.unknown()),
    gift_methods: z.array(z.record(z.string(), z.unknown())),
    music_path: z.string().nullable(),
    music_title: z.string().nullable(),
    theme: z.record(z.string(), z.unknown()),
    timezone: z.string(),
    wishes_enabled: z.boolean(),
    wishes_editable: z.boolean(),
    public_wishes: z.boolean(),
  }),
  events: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["ceremony", "reception", "other"]),
      title: i18n,
      starts_at: z.string(),
      ends_at: z.string().nullable(),
      myanmar_date_text: i18n,
      venue_name: i18n,
      venue_address: i18n,
      map_url: z.string().nullable(),
    }),
  ),
  photos: z.array(
    z.object({
      id: z.string(),
      storage_path: z.string(),
      width: z.number(),
      height: z.number(),
      kind: z.enum(["portrait", "couple", "traditional", "spread"]),
      alt: i18n,
      is_cover: z.boolean(),
    }),
  ),
  guest: z.object({ display_name: z.string(), display_name_my: z.string().nullable() }).nullable(),
});

export type Invitation = z.infer<typeof InvitationSchema>;
export type I18nText = z.infer<typeof i18n>;

const TOKEN_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Loads a published wedding and, if the token matches, the guest it was sent to. */
export async function getInvitation(slug: string, token: string | undefined): Promise<Invitation | null> {
  if (!TOKEN_RE.test(slug)) return null;
  const safeToken = token && TOKEN_RE.test(token) && token.length <= 64 ? token : null;

  const { data, error } = await createSupabaseGuestClient().rpc("get_invitation", {
    p_slug: slug,
    p_token: safeToken ?? undefined,
  });
  if (error) throw new Error(`get_invitation failed: ${error.message}`);
  if (!data) return null;
  return InvitationSchema.parse(data);
}
