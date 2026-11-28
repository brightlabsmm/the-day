import { Suspense } from "react";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { getWedding } from "@/lib/admin/data";
import { pick } from "@/lib/admin/schemas";
import { mediaUrl } from "@/lib/media";
import { addGiftQr, deletePhoto, movePhoto, removeGiftQr, removeMusic, setCover, uploadMusic, uploadPhoto } from "@/lib/admin/actions/media";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, BilingualField, Card, Empty, Field, Input, Loading, Select } from "@/components/admin/ui";

export default function MediaPage(props: PageProps<"/admin/weddings/[slug]/media">) {
  return (
    <Suspense fallback={<Loading />}>
      <Media {...props} />
    </Suspense>
  );
}

const KINDS = { couple: "Couple (landscape)", portrait: "Portrait (pairs with another)", traditional: "Traditional", spread: "Album spread (full row)" } as const;
type Gift = { label: string; account_name?: string; qr_path: string };
const fileClass =
  "block w-full text-sm text-[#5c524b] file:mr-3 file:rounded-lg file:border file:border-[#ddd1bf] file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#2f2925] hover:file:border-[#b8913f]";

async function Media({ params }: PageProps<"/admin/weddings/[slug]/media">) {
  const { slug } = await params;
  const { supabase, wedding: w } = await getWedding(slug);
  const { data } = await supabase.from("wedding_photos").select("*").eq("wedding_id", w.id).order("sort_order").order("created_at");
  const photos = data ?? [];
  const gifts = (Array.isArray(w.gift_methods) ? w.gift_methods : []) as Gift[];
  const hidden = <input type="hidden" name="slug" value={w.slug} />;

  return (
    <div className="space-y-6">
      <Card title={`Photos (${photos.length}/8)`} description="The cover photo opens the invitation. The rest appear in the gallery in this order.">
        {photos.length === 0 ? (
          <Empty>No photos yet.</Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p, i) => (
              <li key={p.id} className="overflow-hidden rounded-xl border border-[#e7dccb]">
                <div className="relative aspect-[4/3] bg-[#f3ebdf]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, no optimisation needed */}
                  <img src={mediaUrl(p.storage_path)} alt={pick(p.alt)} className="size-full object-cover" />
                  {p.is_cover && (
                    <span className="absolute top-2 left-2">
                      <Badge tone="gold">★ Cover</Badge>
                    </span>
                  )}
                  <span className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">{i + 1}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{KINDS[p.kind as keyof typeof KINDS]?.split(" (")[0] ?? p.kind}</p>
                  <p className="truncate text-xs text-[#8a7f75]">
                    {p.width}×{p.height}
                    {pick(p.alt) && ` · ${pick(p.alt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 border-t border-[#efe6d8] px-2 py-1.5">
                  {(["up", "down"] as const).map((dir) => (
                    <ActionForm key={dir} action={movePhoto}>
                      {hidden}
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value={dir} />
                      <SubmitButton variant="ghost" disabled={dir === "up" ? i === 0 : i === photos.length - 1} aria-label={dir === "up" ? "Move earlier" : "Move later"} title={dir === "up" ? "Move earlier" : "Move later"}>
                        {dir === "up" ? <ArrowUp className="size-4" aria-hidden /> : <ArrowDown className="size-4" aria-hidden />}
                      </SubmitButton>
                    </ActionForm>
                  ))}
                  {!p.is_cover && (
                    <ActionForm action={setCover}>
                      {hidden}
                      <input type="hidden" name="id" value={p.id} />
                      <SubmitButton variant="ghost">
                        <Star className="size-4" aria-hidden /> Cover
                      </SubmitButton>
                    </ActionForm>
                  )}
                  <ActionForm action={deletePhoto} confirm="Delete this photo? This cannot be undone." className="ml-auto">
                    {hidden}
                    <input type="hidden" name="id" value={p.id} />
                    <SubmitButton variant="danger" aria-label="Delete photo" title="Delete photo">
                      <Trash2 className="size-4" aria-hidden />
                    </SubmitButton>
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
        )}

        {photos.length < 8 && (
          <ActionForm action={uploadPhoto} resetOnSuccess submitLabel="Upload photo" className="mt-6 rounded-xl bg-[#faf6f0] p-4">
            {hidden}
            <p className="mb-3 text-sm font-semibold">Add a photo</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Image" hint="JPEG, PNG, WebP or AVIF, up to 15 MB. Location data is removed.">
                <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className={fileClass} />
              </Field>
              <Field label="Layout type">
                <Select name="kind" defaultValue="couple">
                  {Object.entries(KINDS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <BilingualField name="alt" label="Description for screen readers" value={{}} />
            </div>
          </ActionForm>
        )}
      </Card>

      <Card title="Gift QR codes" description="Shown for guests to scan. Display only: payments never pass through The Day.">
        {gifts.length === 0 ? (
          <Empty>No QR codes yet.</Empty>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {gifts.map((g) => (
              <li key={g.qr_path} className="flex items-center gap-3 rounded-xl border border-[#e7dccb] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={mediaUrl(g.qr_path)} alt="" width={64} height={64} className="size-16 rounded-md bg-white object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{g.label}</p>
                  {g.account_name && <p className="truncate text-sm text-[#7a6f66]">{g.account_name}</p>}
                </div>
                <ActionForm action={removeGiftQr} confirm={`Remove the ${g.label} QR code?`}>
                  {hidden}
                  <input type="hidden" name="qr_path" value={g.qr_path} />
                  <SubmitButton variant="danger" aria-label={`Remove ${g.label}`} title="Remove">
                    <Trash2 className="size-4" aria-hidden />
                  </SubmitButton>
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={addGiftQr} resetOnSuccess submitLabel="Add QR code" className="mt-6 rounded-xl bg-[#faf6f0] p-4">
          {hidden}
          <p className="mb-3 text-sm font-semibold">Add a QR code</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Label">
              <Input name="label" required maxLength={40} placeholder="KBZPay, Wave Pay…" />
            </Field>
            <Field label="Account name (optional)">
              <Input name="account_name" maxLength={80} />
            </Field>
            <Field label="QR image">
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className={fileClass} />
            </Field>
          </div>
        </ActionForm>
      </Card>

      <Card title="Background music" description="Plays when a guest taps the music button. Without music, there is no button.">
        {w.music_path ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e7dccb] p-3">
            <div className="min-w-0 flex-1">
              <p className="mb-2 font-medium">{w.music_title ?? "Untitled"}</p>
              <audio controls preload="none" src={mediaUrl(w.music_path)} className="w-full" />
            </div>
            <ActionForm action={removeMusic} confirm="Remove the music?">
              {hidden}
              <SubmitButton variant="danger">
                <Trash2 className="size-4" aria-hidden /> Remove
              </SubmitButton>
            </ActionForm>
          </div>
        ) : (
          <Empty>No music.</Empty>
        )}
        <ActionForm action={uploadMusic} resetOnSuccess submitLabel={w.music_path ? "Replace music" : "Upload music"} className="mt-6 rounded-xl bg-[#faf6f0] p-4">
          {hidden}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (optional)">
              <Input name="title" maxLength={80} placeholder="Uses the file name if empty" />
            </Field>
            <Field label="Audio file" hint="MP3, M4A, AAC or OGG, up to 15 MB.">
              <input name="file" type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg" required className={fileClass} />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
