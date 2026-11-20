export const MEDIA_BUCKET = "wedding-media";

/** Public URL for a file in the wedding-media bucket. */
export function mediaUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
