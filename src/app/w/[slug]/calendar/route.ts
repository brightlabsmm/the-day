import { connection } from "next/server";
import { getInvitation } from "@/lib/invitation";
import { t } from "@/lib/i18n/numerals";

const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** An .ics file for the main event, so guests can add it to any calendar app. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const invitation = await getInvitation(slug, undefined);
  const e = invitation?.events.find((x) => x.kind === "ceremony") ?? invitation?.events[0];
  if (!invitation || !e) return new Response("Not found", { status: 404 });

  const names = `${t(invitation.wedding.partner_one_name, "en")} & ${t(invitation.wedding.partner_two_name, "en")}`;
  const end = e.ends_at ?? new Date(Date.parse(e.starts_at) + 2 * 3600_000).toISOString();
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//THE DAY//Wedding invitation//EN",
    "BEGIN:VEVENT",
    `UID:${invitation.wedding.id}-${e.id}@theday`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(e.starts_at)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`${names} — Wedding`)}`,
    `LOCATION:${esc([t(e.venue_name, "en"), t(e.venue_address, "en")].filter(Boolean).join(", "))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${invitation.wedding.slug}.ics"`,
    },
  });
}
