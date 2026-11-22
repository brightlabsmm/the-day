/*
 * Form helpers for the gift campaign admin. Pure functions, so they are unit-tested.
 */
import { GIFT_CODE_RE } from "@/lib/gift";

type I18n = { my?: string; en?: string };

/**
 * Sign-up choices are edited as two textareas, one line per choice, Burmese
 * and English paired by line number. Blank pairs are dropped; at most 8 kept.
 */
export function intentionsFromForm(form: FormData): I18n[] {
  const lines = (lang: "my" | "en") => String(form.get(`intentions_${lang}`) ?? "").split(/\r?\n/).map((l) => l.trim().slice(0, 160));
  const my = lines("my");
  const en = lines("en");
  const out: I18n[] = [];
  for (let i = 0; i < Math.max(my.length, en.length); i++) {
    const item: I18n = {};
    if (my[i]) item.my = my[i];
    if (en[i]) item.en = en[i];
    if (item.my || item.en) out.push(item);
  }
  return out.slice(0, 8);
}

/** The reverse of intentionsFromForm, for the textareas' default values. */
export function intentionsToText(list: unknown, lang: "my" | "en"): string {
  if (!Array.isArray(list)) return "";
  return list.map((i) => (i && typeof i === "object" ? String((i as I18n)[lang] ?? "") : "")).join("\n");
}

/** Upper-cases a typed code and keeps it only if it is a valid code (A–Z, 0–9, _ and -). Empty means none. */
export function normaliseCode(value: unknown): string | null | undefined {
  const v = String(value ?? "").trim().toUpperCase();
  if (!v) return null;
  return GIFT_CODE_RE.test(v) ? v : undefined;
}
