/**
 * Uploads the demo wedding photos in supabase/seed-media/ to Storage and
 * records them in wedding_photos. Safe to run repeatedly.
 *
 *   pnpm seed:media
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const WEDDING_ID = "00000000-0000-4000-8000-000000000001";
const DIR = path.join(process.cwd(), "supabase/seed-media");

type Kind = "portrait" | "couple" | "traditional" | "spread";
const PHOTOS: { file: string; kind: Kind; cover?: boolean; alt: { en: string; my: string } }[] = [
  { file: "4.jpg", kind: "couple", cover: true, alt: { en: "The couple in white, her long veil flowing across a cream panelled room", my: "ဖြူဖွေးသော မင်္ဂလာဝတ်စုံဖြင့် စုံတွဲ" } },
  { file: "1.jpg", kind: "portrait", alt: { en: "The bride in a lilac off-shoulder ball gown", my: "ခရမ်းနုရောင် ဝတ်စုံဖြင့် သတို့သမီး" } },
  { file: "8.webp", kind: "traditional", alt: { en: "The couple in traditional Myanmar dress on a gilded throne", my: "မြန်မာ့ရိုးရာ ဝတ်စုံဖြင့် ရွှေပလ္လင်ပေါ်ရှိ စုံတွဲ" } },
  { file: "2.jpg", kind: "couple", alt: { en: "The couple smiling, chins resting on their hands", my: "ပြုံးရွှင်နေသော စုံတွဲ" } },
  { file: "3.jpg", kind: "traditional", alt: { en: "The bride in a beaded Myanmar dress before the groom's silhouette", my: "ရိုးရာဝတ်စုံဖြင့် သတို့သမီးနှင့် သတို့သား၏ အရိပ်" } },
  { file: "5.jpg", kind: "couple", alt: { en: "The couple in grey, arm in arm, holding white tulips", my: "မီးခိုးရောင် ဝတ်စုံဖြင့် လက်ချင်းချိတ်ထားသော စုံတွဲ" } },
  { file: "6.jpg", kind: "spread", alt: { en: "Album spread: the couple at a colonial red-brick building in Yangon", my: "ရန်ကုန်ရှိ အုတ်နီအဆောက်အအုံတွင် စုံတွဲ" } },
  { file: "7.jpg", kind: "spread", alt: { en: "Album spread: the couple among gardens and striped arches", my: "ဥယျာဉ်နှင့် မုခ်ဦးများကြားရှိ စုံတွဲ" } },
];

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".png": "image/png" };

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.local)");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { error: delErr } = await db.from("wedding_photos").delete().eq("wedding_id", WEDDING_ID);
  if (delErr) throw delErr;

  for (const [i, p] of PHOTOS.entries()) {
    const buf = await readFile(path.join(DIR, p.file));
    const meta = await sharp(buf).metadata();
    const ext = path.extname(p.file).toLowerCase();
    const storagePath = `${WEDDING_ID}/photos/demo-${path.basename(p.file, ext)}${ext}`;

    const { error: upErr } = await db.storage
      .from("wedding-media")
      .upload(storagePath, buf, { contentType: MIME[ext], upsert: true, cacheControl: "31536000" });
    if (upErr) throw upErr;

    const { error: insErr } = await db.from("wedding_photos").insert({
      wedding_id: WEDDING_ID,
      storage_path: storagePath,
      width: meta.width,
      height: meta.height,
      kind: p.kind,
      alt: p.alt,
      is_cover: !!p.cover,
      sort_order: i,
    });
    if (insErr) throw insErr;
    console.log(`✓ ${p.file} → ${storagePath} (${meta.width}×${meta.height})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
