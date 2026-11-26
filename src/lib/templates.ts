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
    key: "silk",
    name: "Silk",
    blurb: "Blush silk lifts away from a calm ivory page. Soft petals, a calendar you can page through, rounded cards and sage green.",
    mood: "Minimal · blush silk · sage",
  },
  {
    key: "midnight",
    name: "Midnight",
    blurb: "A deep navy night sky with twinkling gold stars. Tap the moon to step inside; constellation lines, a calendar and a calm, glowing page.",
    mood: "Elegant · night sky · navy & gold",
  },
  {
    key: "lantern",
    name: "Lantern",
    blurb: "A warm dusk of paper lanterns. Tap the big lantern to release it and the sky rises away, revealing a glowing amber page.",
    mood: "Warm · festive · plum & amber",
  },
  {
    key: "polaroid",
    name: "Polaroid",
    blurb: "A kraft-paper scrapbook of taped instant photos. Your cover photo develops on a polaroid; tap it to step into the album.",
    mood: "Casual · scrapbook · photo-first",
  },
  {
    key: "botanical",
    name: "Botanical",
    blurb: "Sage-green leaves part like a garden gate. Leafy sprigs frame the names, with a calm cream page and green accents.",
    mood: "Fresh · greenery · sage",
  },
  {
    key: "artdeco",
    name: "Art Deco",
    blurb: "Black and gold geometry. A sunburst gate splits open to a glamorous page of fans, gold lines and bold lettering.",
    mood: "Glamorous · black & gold · 1920s",
  },
  {
    key: "sunrise",
    name: "Sunrise",
    blurb: "A sun rises over layered peach hills to open the page. Warm coral, soft cream and a hopeful new-day feel.",
    mood: "Hopeful · peach & coral · new day",
  },
  {
    key: "spotlight",
    name: "Spotlight",
    blurb: "Dark velvet curtains lit by a spotlight on your names open by themselves onto a full-screen photo, with names in script on the left and date and venue below.",
    mood: "Cinematic · photo-first · olive & gold",
  },
  {
    key: "garden",
    name: "Sepia Garden",
    blurb: "A quiet film-photo invitation: a sepia cover with script names and a thin-outlined RSVP button, a taupe page in a typewriter face, and a stack of photos to close.",
    mood: "Quiet · sepia film · typewriter",
  },
  {
    key: "ribbon",
    name: "Blue Ribbon",
    blurb: "A hand-drawn, light-pink and cobalt-blue invitation: brush-script names over a toast of champagne glasses, arched photos, line drawings for each detail and a ribbon to close.",
    mood: "Illustrated · pink & blue · outdoor",
  },
  {
    key: "renewal",
    name: "Golden Renewal",
    blurb: "A botanical invitation in olive green and cream: a monogram entwined with a painted tulip, oval photographs with flowers laid over them, bordered detail cards and a program inside an arch.",
    mood: "Botanical · olive & cream · painted flowers",
  },
  {
    key: "scrapbook",
    name: "Pressed Scrapbook",
    blurb: "A paper scrapbook invitation: loopy rust-red handwriting, a polaroid and pressed flowers on the cover, masking-tape buttons, collage drawings for each detail, and a kraft envelope of contact cards.",
    mood: "Scrapbook · paper & pressed flowers · rust red",
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
