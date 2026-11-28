import { Suspense } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { getWedding, formatWhen } from "@/lib/admin/data";
import { isoToLocalInput } from "@/lib/admin/forms";
import { pick } from "@/lib/admin/schemas";
import { occasionOf } from "@/lib/occasion";
import { deleteEvent, saveEvent } from "@/lib/admin/actions/events";
import type { Database } from "@/lib/supabase/database.types";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, BilingualField, Card, Empty, Field, Input, Loading, Select } from "@/components/admin/ui";

export default function EventsPage(props: PageProps<"/admin/weddings/[slug]/events">) {
  return (
    <Suspense fallback={<Loading />}>
      <Events {...props} />
    </Suspense>
  );
}

type EventRow = Database["public"]["Tables"]["wedding_events"]["Row"];
const KINDS = { ceremony: "Ceremony", reception: "Reception", other: "Other" } as const;
/** A birthday uses the same three kinds with party wording: the main event is what the countdown and calendar use. */
const BIRTHDAY_KINDS = { ceremony: "Party (main event)", reception: "Meal", other: "Other" } as const;
type Kinds = Record<"ceremony" | "reception" | "other", string>;

async function Events({ params }: PageProps<"/admin/weddings/[slug]/events">) {
  const { slug } = await params;
  const { supabase, wedding: w } = await getWedding(slug);
  const { data } = await supabase.from("wedding_events").select("*").eq("wedding_id", w.id).order("sort_order").order("starts_at");
  const events = data ?? [];
  const kinds: Kinds = occasionOf(w.cover_text) === "birthday" ? BIRTHDAY_KINDS : KINDS;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#7a6f66]">Times are in {w.timezone}. Click an event to edit it.</p>
      {events.length === 0 && <Empty>No events yet. Add the ceremony below.</Empty>}
      {events.map((e) => (
        <details key={e.id} className="group rounded-2xl border border-[#e7dccb] bg-white shadow-[0_1px_2px_rgba(60,40,20,0.05)]">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                {pick(e.title, kinds[e.kind as keyof Kinds] ?? "Event")} <Badge tone="gold">{kinds[e.kind as keyof Kinds] ?? e.kind}</Badge>
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-[#7a6f66]">
                <span>{formatWhen(e.starts_at, w.timezone)}</span>
                {pick(e.venue_name) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {pick(e.venue_name)}
                  </span>
                )}
              </p>
            </div>
            <span className="text-sm font-medium text-[#8a6a2a] group-open:hidden">Edit</span>
            <span className="hidden text-sm font-medium text-[#8a6a2a] group-open:inline">Close</span>
          </summary>
          <div className="border-t border-[#efe6d8] px-5 py-5">
            <EventForm slug={w.slug} tz={w.timezone} event={e} kinds={kinds} />
            <ActionForm action={deleteEvent} confirm="Delete this event? It is removed from the invitation." className="mt-3 flex justify-end">
              <input type="hidden" name="slug" value={w.slug} />
              <input type="hidden" name="id" value={e.id} />
              <SubmitButton variant="danger">
                <Trash2 className="size-4" aria-hidden /> Delete event
              </SubmitButton>
            </ActionForm>
          </div>
        </details>
      ))}
      <Card title="Add an event" description="The main event, a meal, or anything else guests should come to.">
        <EventForm slug={w.slug} tz={w.timezone} kinds={kinds} />
      </Card>
    </div>
  );
}

function EventForm({ slug, tz, event, kinds }: { slug: string; tz: string; event?: EventRow; kinds: Kinds }) {
  return (
    <ActionForm action={saveEvent} submitLabel={event ? "Save event" : "Add event"} resetOnSuccess={!event}>
      <input type="hidden" name="slug" value={slug} />
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="space-y-4">
        <BilingualField name="title" label="Title" value={event?.title} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Starts">
            <Input name="starts" type="datetime-local" required defaultValue={isoToLocalInput(event?.starts_at ?? null, tz)} />
          </Field>
          <Field label="Ends (optional)">
            <Input name="ends" type="datetime-local" defaultValue={isoToLocalInput(event?.ends_at ?? null, tz)} />
          </Field>
          <Field label="Type">
            <Select name="kind" defaultValue={event?.kind ?? "ceremony"}>
              {Object.entries(kinds).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <BilingualField name="myanmar_date_text" label="Myanmar-calendar date" hint="Typed as it should read; it is never worked out for you." value={event?.myanmar_date_text} />
        <BilingualField name="venue_name" label="Venue" value={event?.venue_name} />
        <BilingualField name="venue_address" label="Address" value={event?.venue_address} />
        <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
          <Field label="Google Maps link">
            <Input name="mapUrl" type="url" pattern="https://.*" placeholder="https://maps.app.goo.gl/…" defaultValue={event?.map_url ?? ""} />
          </Field>
          <Field label="Order" hint="Lower comes first.">
            <Input name="sortOrder" type="number" min={0} max={99} defaultValue={event?.sort_order ?? 0} />
          </Field>
        </div>
      </div>
    </ActionForm>
  );
}
