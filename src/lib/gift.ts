/*
 * Gift invitations (/g/<slug>): a campaign with twelve gifts a visitor unlocks
 * one by one. Shared by the server (parsing get_gift_campaign) and the page.
 */
import { z } from "zod";

export const GIFT_VIEWS = ["lotus", "astrolabe", "tarot"] as const;
export type GiftView = (typeof GIFT_VIEWS)[number];

export const GIFT_KINDS = ["voucher", "audio", "book", "oracle"] as const;
export type GiftKind = (typeof GIFT_KINDS)[number];

/** Icons a gift can show. Keys are stored in gift_items.icon; the page maps them to drawings. */
export const GIFT_ICONS = [
  "lotus",
  "gem",
  "book",
  "crystal",
  "cap",
  "flame",
  "moon",
  "necklace",
  "pen",
  "leaf",
  "sparkles",
  "crown",
  "star",
  "gift",
  "heart",
  "music",
  "sun",
] as const;
export type GiftIcon = (typeof GIFT_ICONS)[number];

export const GIFT_CODE_RE = /^[A-Z0-9_-]{1,40}$/;
export const MAX_GIFTS = 12;

const i18n = z.object({ my: z.string().optional(), en: z.string().optional() }).catchall(z.unknown());

const ItemSchema = z.object({
  position: z.number().int().min(1).max(MAX_GIFTS),
  icon: z.string().transform((v): GiftIcon => ((GIFT_ICONS as readonly string[]).includes(v) ? (v as GiftIcon) : "star")),
  kind: z.enum(GIFT_KINDS).catch("voucher"),
  category: i18n,
  title: i18n,
  description: i18n,
  detail_title: i18n,
  detail_text: i18n,
  code: z.string().nullable(),
});

const CampaignSchema = z.object({
  campaign: z.object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(["draft", "published"]),
    title: i18n,
    subtitle: i18n,
    default_view: z.enum(GIFT_VIEWS).catch("lotus"),
    shop_url: z.string().nullable(),
    invite_enabled: z.boolean(),
    invite_title: i18n,
    invite_text: i18n,
    invite_intentions: z.array(i18n).catch([]),
  }),
  items: z.array(ItemSchema),
});

export type GiftCampaign = z.infer<typeof CampaignSchema>;
export type GiftItem = z.infer<typeof ItemSchema>;

/**
 * Parses get_gift_campaign's result. Gifts without a title in either language
 * are left out (a new campaign starts with twelve blank slots), and positions
 * are kept in order.
 */
export function parseGiftCampaign(data: unknown): GiftCampaign | null {
  if (!data) return null;
  const parsed = CampaignSchema.parse(data);
  const items = parsed.items
    .filter((i) => !!(i.title.en?.trim() || i.title.my?.trim()))
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_GIFTS);
  return { ...parsed, items };
}

/** localStorage key for the positions this browser has unlocked. */
export const unlockedKey = (slug: string) => `theday_gift_${slug}`;

/** Reads a stored list of unlocked positions, ignoring anything malformed or out of range. */
export function parseUnlocked(raw: string | null, positions: number[]): number[] {
  if (!raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const valid = new Set(positions);
    return [...new Set(list.filter((n): n is number => typeof n === "number" && valid.has(n)))].sort((a, b) => a - b);
  } catch {
    return [];
  }
}
