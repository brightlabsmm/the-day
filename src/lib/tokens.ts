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

function randomSuffix(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Guest link token: readable name + 8 random characters (about 39 bits), e.g. "ko-aung-7k2fp3qx".
 * The token is the guest's only credential for wishes, so the suffix is long enough
 * that links cannot be guessed. Older 4-character tokens keep working.
 * Burmese-only names slugify to nothing, so they fall back to "guest".
 */
export function generateGuestToken(name: string): string {
  return `${slugify(name) || "guest"}-${randomSuffix()}`;
}
