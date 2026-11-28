import { z } from "zod";

/** A link code: lowercase letters, numbers and single dashes, as the database also checks. */
export const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);
export const Id = z.uuid();
export const Status = z.enum(["draft", "published"]);

/** Text stored in both languages. Reading through this keeps odd stored values from breaking a page. */
export const I18n = z.object({ my: z.string().optional(), en: z.string().optional() }).catch({});
export type I18n = z.infer<typeof I18n>;

/** The English text, else the Burmese, else the fallback. */
export const pick = (value: unknown, fallback = ""): string => {
  const v = I18n.parse(value ?? {});
  return v.en || v.my || fallback;
};

/** What every admin action answers: shown beside the form's button. */
export type ActionResult = { ok: boolean; message: string; at: number } | null;
export type Action = (prev: ActionResult, form: FormData) => Promise<ActionResult>;

export const ok = (message = "Saved"): NonNullable<ActionResult> => ({ ok: true, message, at: Date.now() });
export const fail = (message: string): NonNullable<ActionResult> => ({ ok: false, message, at: Date.now() });

/** Reads a checkbox. */
export const checked = (form: FormData, name: string) => form.get(name) === "on";
/** Reads a text field, trimmed and cut to `max` characters. */
export const text = (form: FormData, name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
