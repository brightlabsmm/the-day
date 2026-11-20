// Unambiguous lowercase alphabet (no 0/o, 1/l/i).
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randomSuffix(length = 4): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Guest link token: readable name + random suffix, e.g. "ko-aung-7k2f".
 * Burmese-only names slugify to nothing, so they fall back to "guest".
 */
export function generateGuestToken(name: string): string {
  return `${slugify(name) || "guest"}-${randomSuffix()}`;
}
