import { z } from "zod";
import type { Invitation } from "@/lib/invitation";

/**
 * Per-wedding extras stored in weddings.theme (jsonb), set from wedding.json:
 *   { "snow": true, "hide": ["schedule"] }
 * Unknown keys are ignored so older rows keep working.
 */
const Theme = z
  .object({
    /** Falling snow over the page once the guest starts scrolling. */
    snow: z.boolean().catch(false).default(false),
    /** Sections to leave out even when they have content. */
    hide: z.array(z.enum(["schedule"])).catch([]).default([]),
  })
  .catch({ snow: false, hide: [] });

export type WeddingTheme = z.infer<typeof Theme>;

export function themeOf(invitation: Invitation): WeddingTheme {
  return Theme.parse(invitation.wedding.theme ?? {});
}

export function isHidden(invitation: Invitation, section: WeddingTheme["hide"][number]): boolean {
  return themeOf(invitation).hide.includes(section);
}
