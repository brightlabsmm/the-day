# THE DAY landing page: image prompts

Prompts for an AI image generator (Midjourney, Ideogram, Firefly, ChatGPT images). The aim is sharp, high-resolution assets that match the Canva design.

Two rules that fix the blur:

- Generate large, about 2-4x the size shown on the page.
- Ask for blank screens and blank cards. The real text and screens are laid on top in code, so they stay sharp.

## Shared style block (add to every prompt)

> soft warm cream and beige palette, muted gold accents (#b8913f), natural soft window light, minimal luxury wedding stationery aesthetic, shallow depth of field, matte paper texture, no text, no logos, no watermark, ultra high resolution, photorealistic

## A. Photo assets

Ask for PNG with a transparent background, or plain white and cut out later.

| File | Where it goes | Prompt (add the style block) | Size |
|---|---|---|---|
| `vase.png` | hero, right | A small round beige ceramic vase with tall dried pampas grass stems, isolated on plain white background, studio product photo, centered | 2400x3200 |
| `device-monitor.png` | hero, centre | A silver iMac-style desktop monitor, front view, perfectly flat, **blank cream-colored screen**, isolated on white background, soft shadow under the stand | 3000x2400 |
| `device-tablet.png` | hero, left | Black-bezel tablet, front view, upright, screen showing a single peach peony on a warm taupe background, isolated on white | 1600x2200 |
| `device-phone.png` | hero, right | Modern black smartphone, front view, screen showing dried flower stems on a warm taupe background, isolated on white | 1200x2400 |
| `plate-card.png` | Process screen | Top-down shot of a rough-edged handmade beige ceramic plate on linen, a **blank cream greeting card** resting on it, dried gypsophila lying beside it, soft shadows | 3200x2400 |
| `contact-scene.png` | Contact screen | A **blank cream card standing upright** on soft cream linen cloth, tall dried gypsophila stems behind it, warm backlight, empty space on the left third | 3200x2100 |
| `services-devices.png` | Services screen | A tablet and a smartphone resting on cream linen, **blank cream screens with thin gold arch outline**, dried flower sprig in the corner, warm light, no text | 2400x2000 |
| `template-classic.png` | template cards | One **blank cream invitation card** on cream linen with white roses and greenery, flat lay, 4:3 | 2000x1600 |
| `template-modern.png` | template cards | One **blank cream invitation card** on beige paper with a soft peach watercolour shape, flat lay, 4:3 | 2000x1600 |
| `template-playful.png` | template cards | One **blank cream invitation card** on pink fabric with small balloons, flat lay, 4:3 | 2000x1600 |

## B. Gold line art

Prefer SVG, otherwise transparent PNG. Add this style line to each prompt:

> single-weight hand-drawn fine line illustration, metallic gold (#b8913f), slightly sketchy pen texture, transparent background, vector, no fill

1. **Bouquet with envelope** (`bouquet-envelope`): a peony bouquet tied with a ribbon next to a small envelope with a heart seal.
2. **Envelope** (`envelope`): a closed envelope with a tiny heart seal, slightly rotated.
3. **Leaf sprig, tall** (`leaf-tall`): a single olive-like branch with 9-11 leaves, tilted.
4. **Leaf sprig, short** (`leaf-short`): a small branch with 5 leaves.
5. **Hearts** (`hearts`): a 3-piece set of tiny outline hearts, plus one looping line ending in a heart outline (for the footer).
6. **Divider** (`divider`): a thin gold line with a small solid heart in the middle. This can also be drawn in code.

If your tool has a vector or SVG mode (Recraft, Illustrator Firefly), choose it. Vectors never blur.

## C. Icon set (SVG strongly recommended)

> A set of 13 matching fine-line icons in metallic gold, consistent 2px stroke, rounded ends, square 1:1 canvas each, transparent background, vector

- **Events (9):** wedding rings, birthday cake, engagement ring, two hearts, baby footprints, balloons, briefcase, lantern, pencil-in-square.
- **Features (4):** envelope with heart, flower, paper plane, globe.
- **Process (3, dark grey #3b3632 instead of gold):** picture frame, edit pencil, paper plane.

The previous icon exports were only about 50-80px wide. Even 512px icons will look sharp.

## D. Export checklist

- **Format:** PNG with a transparent background, or SVG. Avoid JPG for cut-outs.
- **Size:** 2-3x the display size.
- **File names:** use the names above, then send them back to be swapped into `public/landing/`.
- **Cut-outs:** if the generator cannot make transparent backgrounds, remove them with remove.bg or Photoshop "Remove background" first.
- **Consistency:** generate each family with the same style block, the same warm light and the same gold, so they feel like one set.
- **Style reference:** upload the Canva screens as a style reference (Midjourney `--sref`, Ideogram style reference). Use it with the first prompt, then keep that style for the rest.
