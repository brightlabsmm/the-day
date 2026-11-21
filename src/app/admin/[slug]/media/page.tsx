import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/media";
import { AdminNav, I18nField, inputClass } from "@/components/admin/admin-nav";
import {
  addGift,
  deletePhoto,
  movePhoto,
  removeGift,
  removeMusic,
  setCover,
  uploadMusic,
  uploadPhoto,
} from "../../media-actions";

export default function MediaPage(props: PageProps<"/admin/[slug]/media">) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <Media {...props} />
      </Suspense>
    </main>
  );
}

const ERRORS: Record<string, string> = {
  file: "Choose a file under 15 MB.",
  image: "That file could not be read as an image.",
  audio: "Music must be MP3, M4A, AAC or OGG.",
  limit: "A wedding can have at most 8 photos.",
  upload: "The upload failed. Please try again.",
  gift: "Enter a label and choose a QR image.",
};

type Gift = { label: string; account_name?: string; qr_path: string };
const btn = "label-caps border border-navy bg-navy px-5 py-2 text-ivory";
const link = "label-caps underline";

async function Media({ params, searchParams }: PageProps<"/admin/[slug]/media">) {
  const { slug } = await params;
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: w } = await supabase.from("weddings").select("*").eq("slug", slug).maybeSingle();
  if (!w) notFound();
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", w.id)
    .order("sort_order")
    .order("created_at");
  const gifts = (Array.isArray(w.gift_methods) ? w.gift_methods : []) as Gift[];

  return (
    <>
      <AdminNav slug={w.slug} current="/media" />
      {typeof error === "string" && ERRORS[error] && (
        <p role="alert" className="mt-4 border border-red-800/40 bg-red-50 px-3 py-2 text-red-900">
          {ERRORS[error]}
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">Photos ({photos?.length ?? 0}/8)</h2>
        <ul className="mt-3 divide-y divide-navy/20 border border-navy/30">
          {(photos ?? []).map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, no optimisation needed */}
              <img src={mediaUrl(p.storage_path)} alt="" width={80} height={80} className="size-20 object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p>
                  {p.kind} · {p.width}×{p.height} {p.is_cover && <strong className="text-gold-deep">· COVER</strong>}
                </p>
                <p className="truncate text-ink-soft">{(p.alt as { en?: string }).en ?? ""}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={movePhoto}>
                    <input type="hidden" name="slug" value={w.slug} />
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button className={link} disabled={(dir === "up" && i === 0) || (dir === "down" && i === (photos?.length ?? 1) - 1)}>
                      {dir === "up" ? "Move up" : "Move down"}
                    </button>
                  </form>
                ))}
                {!p.is_cover && (
                  <form action={setCover}>
                    <input type="hidden" name="slug" value={w.slug} />
                    <input type="hidden" name="id" value={p.id} />
                    <button className={link}>Make cover</button>
                  </form>
                )}
                <form action={deletePhoto}>
                  <input type="hidden" name="slug" value={w.slug} />
                  <input type="hidden" name="id" value={p.id} />
                  <button className={`${link} text-red-800`}>Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form action={uploadPhoto} className="mt-4 space-y-3 border border-navy/30 p-4">
          <input type="hidden" name="slug" value={w.slug} />
          <h3 className="label-caps">Add a photo</h3>
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
          <label className="label-caps block">
            Layout type
            <select name="kind" defaultValue="couple" className={`${inputClass} mt-1 max-w-60`}>
              <option value="couple">Couple (landscape)</option>
              <option value="portrait">Portrait (pairs with another)</option>
              <option value="traditional">Traditional</option>
              <option value="spread">Album spread (full row)</option>
            </select>
          </label>
          <I18nField name="alt" label="Description for screen readers" value={{}} />
          <button className={btn}>Upload photo</button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Gift QR codes</h2>
        <ul className="mt-3 divide-y divide-navy/20 border border-navy/30">
          {gifts.length === 0 && <li className="px-4 py-3 text-ink-soft">None yet.</li>}
          {gifts.map((g) => (
            <li key={g.qr_path} className="flex items-center gap-4 px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              <img src={mediaUrl(g.qr_path)} alt="" width={64} height={64} className="size-16 bg-white object-contain" />
              <p className="flex-1">
                {g.label} {g.account_name && <span className="text-ink-soft">· {g.account_name}</span>}
              </p>
              <form action={removeGift}>
                <input type="hidden" name="slug" value={w.slug} />
                <input type="hidden" name="qr_path" value={g.qr_path} />
                <button className={`${link} text-red-800`}>Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addGift} className="mt-4 space-y-3 border border-navy/30 p-4">
          <input type="hidden" name="slug" value={w.slug} />
          <h3 className="label-caps">Add a QR code (display only)</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="label" required maxLength={40} placeholder="KBZPay, Wave Pay…" className={inputClass} />
            <input name="account_name" maxLength={80} placeholder="Account name (optional)" className={inputClass} />
          </div>
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          <button className={btn}>Add QR code</button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Background music</h2>
        {w.music_path ? (
          <div className="mt-3 space-y-2 border border-navy/30 p-4">
            <p>{w.music_title ?? "Untitled"}</p>
            <audio controls preload="none" src={mediaUrl(w.music_path)} className="w-full" />
            <form action={removeMusic}>
              <input type="hidden" name="slug" value={w.slug} />
              <button className={`${link} text-red-800`}>Remove music</button>
            </form>
          </div>
        ) : (
          <p className="mt-3 text-ink-soft">No music. Guests will see no music button.</p>
        )}
        <form action={uploadMusic} className="mt-4 space-y-3 border border-navy/30 p-4">
          <input type="hidden" name="slug" value={w.slug} />
          <h3 className="label-caps">{w.music_path ? "Replace music" : "Upload music"}</h3>
          <input name="title" maxLength={80} placeholder="Title (optional)" className={inputClass} />
          <input name="file" type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg" required />
          <button className={btn}>Upload</button>
        </form>
      </section>
    </>
  );
}
