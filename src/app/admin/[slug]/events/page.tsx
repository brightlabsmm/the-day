import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { isoToLocalInput } from "@/lib/admin/forms";
import { AdminNav, I18nField, inputClass } from "@/components/admin/admin-nav";
import { deleteEvent, saveEvent } from "../../actions";

export default function EventsPage(props: PageProps<"/admin/[slug]/events">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Events {...props} />
      </Suspense>
    </main>
  );
}

type EventRow = {
  id: string;
  kind: string;
  title: unknown;
  starts_at: string;
  ends_at: string | null;
  myanmar_date_text: unknown;
  venue_name: unknown;
  venue_address: unknown;
  map_url: string | null;
  sort_order: number;
};

async function Events({ params }: PageProps<"/admin/[slug]/events">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data: w } = await supabase.from("weddings").select("id, slug, timezone").eq("slug", slug).maybeSingle();
  if (!w) notFound();
  const { data: events } = await supabase
    .from("wedding_events")
    .select("*")
    .eq("wedding_id", w.id)
    .order("sort_order")
    .order("starts_at");

  return (
    <>
      <AdminNav slug={w.slug} current="/events" />
      <p className="mt-4 text-sm text-ink-soft">Times are in {w.timezone}.</p>
      <div className="mt-4 space-y-8">
        {(events ?? []).map((e) => (
          <EventForm key={e.id} slug={w.slug} tz={w.timezone} event={e} />
        ))}
        <section>
          <h2 className="font-display text-2xl font-semibold">Add an event</h2>
          <EventForm slug={w.slug} tz={w.timezone} />
        </section>
      </div>
    </>
  );
}

function EventForm({ slug, tz, event }: { slug: string; tz: string; event?: EventRow }) {
  return (
    <div className="border border-navy/30 p-4">
      <form action={saveEvent} className="space-y-4">
        <input type="hidden" name="slug" value={slug} />
        {event && <input type="hidden" name="id" value={event.id} />}
        <I18nField name="title" label="Title" value={event?.title} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="label-caps block">
            Starts
            <input name="starts" type="datetime-local" required defaultValue={isoToLocalInput(event?.starts_at ?? null, tz)} className={`${inputClass} mt-1`} />
          </label>
          <label className="label-caps block">
            Ends (optional)
            <input name="ends" type="datetime-local" defaultValue={isoToLocalInput(event?.ends_at ?? null, tz)} className={`${inputClass} mt-1`} />
          </label>
          <label className="label-caps block">
            Type
            <select name="kind" defaultValue={event?.kind ?? "ceremony"} className={`${inputClass} mt-1`}>
              <option value="ceremony">Ceremony</option>
              <option value="reception">Reception</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <I18nField name="myanmar_date_text" label="Myanmar-calendar date (typed, never computed)" value={event?.myanmar_date_text} />
        <I18nField name="venue_name" label="Venue" value={event?.venue_name} />
        <I18nField name="venue_address" label="Address" value={event?.venue_address} />
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
          <label className="label-caps block">
            Google Maps link (https)
            <input name="mapUrl" type="url" pattern="https://.*" defaultValue={event?.map_url ?? ""} className={`${inputClass} mt-1`} />
          </label>
          <label className="label-caps block">
            Order
            <input name="sortOrder" type="number" min={0} max={99} defaultValue={event?.sort_order ?? 0} className={`${inputClass} mt-1`} />
          </label>
        </div>
        <button className="label-caps border border-navy bg-navy px-6 py-2.5 text-ivory">{event ? "Save event" : "Add event"}</button>
      </form>
      {event && (
        <form action={deleteEvent} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <button className="label-caps text-red-800 underline">Delete event</button>
        </form>
      )}
    </div>
  );
}
