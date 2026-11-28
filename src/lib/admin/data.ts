import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "./auth";

/**
 * The wedding for an admin page, read once per request: the layout's header and the page below it
 * share the same read. Shows the 404 page when no wedding has that link code.
 */
export const getWedding = cache(async (slug: string) => {
  const { supabase } = await requireAdmin();
  const { data: wedding } = await supabase.from("weddings").select("*").eq("slug", slug).maybeSingle();
  if (!wedding) notFound();
  return { supabase, wedding };
});

/** The gift campaign for an admin page, read once per request. */
export const getCampaign = cache(async (slug: string) => {
  const { supabase } = await requireAdmin();
  const { data: campaign } = await supabase.from("gift_campaigns").select("*").eq("slug", slug).maybeSingle();
  if (!campaign) notFound();
  return { supabase, campaign };
});

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** A date and time in the given zone, e.g. "13 Feb 2027, 11:30". */
export const formatWhen = (iso: string, timeZone = "Asia/Yangon") =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(iso));
