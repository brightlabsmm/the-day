import { readFile } from "node:fs/promises";
import path from "node:path";

const FILES: Record<string, string> = { "cover.jpg": "image/jpeg", "corner.png": "image/png", "wreath.png": "image/png", "watercolor.jpg": "image/jpeg" };

/** Development only: serves Watercolour Bloom's painted pieces from supabase/seed-media/bloom for /dev/bloom. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (process.env.NODE_ENV === "production" || !FILES[file]) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(process.cwd(), "supabase", "seed-media", "bloom", file));
    return new Response(body, { headers: { "content-type": FILES[file], "cache-control": "no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
