/** Page designs a wedding can use. Stored in weddings.template_key. */
export const TEMPLATES = [
  {
    key: "classic",
    name: "Classic Card",
    blurb: "A printed card in a paper sleeve: gold foil names, double-line frames and an album page for photos.",
    mood: "Traditional · warm paper · gold",
  },
  {
    key: "editorial",
    name: "Editorial",
    blurb: "Black and white, magazine style. A full-screen photo, a giant monogram and oversized serif words.",
    mood: "Modern · monochrome · bold type",
  },
  {
    key: "envelope",
    name: "Envelope",
    blurb: "A cream envelope sealed with wax. Open it to a soft, romantic page with script lettering.",
    mood: "Romantic · cream · script",
  },
  {
    key: "theatre",
    name: "Theatre",
    blurb: "Velvet curtains and a spotlit stage. Enter the theatre, then follow the day act by act with a flip-card countdown.",
    mood: "Dramatic · velvet · gold",
  },
  {
    key: "record",
    name: "Vinyl Record",
    blurb: "A spinning record that plays your song, with the story told track by track. Breezy, seaside blues.",
    mood: "Playful · seaside blue · music",
  },
  {
    key: "wildflower",
    name: "Wildflower",
    blurb: "Soft peach and olive. Watercolour wildflowers frame the names, and each section sits in a scalloped frame.",
    mood: "Gentle · floral · peach & olive",
  },
  {
    key: "shutters",
    name: "Shutters",
    blurb: "Blue wooden shutters swing open onto a sunlit sea view. Whitewash, bougainvillea pink and arched window frames.",
    mood: "Mediterranean · blue & pink · sunny",
  },
  {
    key: "scratch",
    name: "Scratch to Reveal",
    blurb: "A playful rose-pink invitation: scratch the heart to reveal it, then a calendar and hearts.",
    mood: "Playful · rose pink · interactive",
  },
] as const;

export type TemplateKey = (typeof TEMPLATES)[number]["key"];

export function templateKey(value: unknown): TemplateKey {
  return TEMPLATES.some((t) => t.key === value) ? (value as TemplateKey) : "classic";
}
