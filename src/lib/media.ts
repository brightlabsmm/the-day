export const MEDIA_BUCKET = "wedding-media";

/** Public URL for a file in the wedding-media bucket. */
export function mediaUrl(storagePath: string): string {
  // A path starting with "/" is served by this app (the /dev/bloom preview); storage paths never do.
  if (storagePath.startsWith("/")) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
