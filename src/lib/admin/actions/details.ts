"use server";

import type { Database } from "@/lib/supabase/database.types";
import { templateFor } from "@/lib/templates";
import { occasionOf } from "@/lib/occasion";
import { dressCodeFromForm, faqFromForm, i18nFromForm, storyFromForm, tipsFromForm } from "../forms";
import { checked, fail, ok, Status, text, type ActionResult } from "../schemas";
import { dbFail, refreshWedding, weddingFromForm } from "./context";

/*
 * The Details page is four cards, each saved on its own, so a mistake in one card never blocks
 * the others and only what is on screen is written.
 */

type WeddingUpdate = Database["public"]["Tables"]["weddings"]["Update"];
type Wedding = Database["public"]["Tables"]["weddings"]["Row"];
type Json = Record<string, unknown>;

const asObject = (v: unknown): Json => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {});

async function update(form: FormData, patch: (wedding: Wedding) => WeddingUpdate | ActionResult): Promise<ActionResult> {
  const ctx = await weddingFromForm(form);
  if (ctx.error) return ctx.error;
  const changes = patch(ctx.wedding);
  if (changes && "ok" in changes) return changes as ActionResult;
  const { error } = await ctx.supabase.from("weddings").update(changes as WeddingUpdate).eq("id", ctx.wedding.id);
  if (error) return dbFail(error);
  refreshWedding();
  return ok();
}

function familySide(form: FormData, side: "partner_one" | "partner_two", before: Json) {
  const lineage = i18nFromForm(form, `${side}_lineage`);
  const credentials = text(form, `${side}_credentials`, 60);
  const rest = { ...before };
  delete rest.lineage;
  delete rest.credentials;
  return { ...rest, ...(Object.keys(lineage).length ? { lineage } : {}), ...(credentials ? { credentials } : {}) };
}

/** Names, monogram and family lineage. */
export async function saveCouple(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return update(form, (w) => {
    const one = i18nFromForm(form, "partner_one_name");
    const two = i18nFromForm(form, "partner_two_name");
    if (!Object.keys(one).length || !Object.keys(two).length) return fail("Both partners need a name in at least one language.");
    const family = asObject(w.family);
    return {
      partner_one_name: one,
      partner_two_name: two,
      monogram: text(form, "monogram", 12) || null,
      family: {
        ...family,
        partner_one: familySide(form, "partner_one", asObject(family.partner_one)),
        partner_two: familySide(form, "partner_two", asObject(family.partner_two)),
      },
    };
  });
}

/** A birthday's name, age line and monogram. Partner two stays empty. */
export async function saveHonoree(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return update(form, (w) => {
    const name = i18nFromForm(form, "partner_one_name");
    if (!Object.keys(name).length) return fail("Enter the name in at least one language.");
    const age = i18nFromForm(form, "age");
    const cover: Json = { ...asObject(w.cover_text), occasion: "birthday" };
    if (Object.keys(age).length) cover.age = age;
    else delete cover.age;
    const contact = text(form, "rsvp_contact", 40);
    if (contact) cover.rsvp_contact = contact;
    else delete cover.rsvp_contact;
    return {
      partner_one_name: name,
      partner_two_name: {},
      monogram: text(form, "monogram", 12) || null,
      cover_text: cover as WeddingUpdate["cover_text"],
    };
  });
}

/** Design, publishing and which sections guests see. */
export async function saveSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return update(form, (w) => {
    const status = Status.safeParse(form.get("status"));
    if (!status.success) return fail("Choose Draft or Published.");
    return {
      status: status.data,
      template_key: templateFor(form.get("template_key"), occasionOf(w.cover_text)),
      rsvp_enabled: checked(form, "rsvp_enabled"),
      seating_enabled: checked(form, "seating_enabled"),
      wishes_enabled: checked(form, "wishes_enabled"),
      wishes_editable: checked(form, "wishes_editable"),
      public_wishes: checked(form, "public_wishes"),
    };
  });
}

/**
 * The invitation's wording. The cover lines are merged into cover_text, which also holds each
 * design's own artwork and wording (art, ribbon, renewal, ...), so those are kept.
 */
export async function saveWording(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return update(form, (w) => ({
    tagline: i18nFromForm(form, "tagline"),
    invitation_text: i18nFromForm(form, "invitation_text"),
    note: i18nFromForm(form, "note"),
    closing_quote: i18nFromForm(form, "closing_quote"),
    cover_text: {
      ...asObject(w.cover_text),
      corner_left: i18nFromForm(form, "cover_corner_left"),
      corner_right: i18nFromForm(form, "cover_corner_right"),
      script: i18nFromForm(form, "cover_script"),
      footer: i18nFromForm(form, "cover_footer"),
    },
  }));
}

/** Story, dress code, FAQ and good-to-know tips. */
export async function saveExtras(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return update(form, () => ({
    story: storyFromForm(form),
    dress_code: dressCodeFromForm(form),
    faq: faqFromForm(form),
    good_to_know: tipsFromForm(form),
  }));
}
