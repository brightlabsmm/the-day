# THE DAY landing page: ChatGPT image prompts (all events)

THE DAY makes invitations for **every** celebration, not only weddings. The landing page lists nine event types (Wedding, Birthday, Engagement, Anniversary, Baby Celebration, Party, Corporate Event, Cultural Celebration, Custom Event) and serves Myanmar, Thailand and Taiwan. The pictures should say the same thing.

## What the page shows today

| Area | Today | Problem |
|---|---|---|
| Hero devices | monitor shows the site, tablet a peony, phone dried flowers | Reads as florals only, and the site screenshot inside `monitor.webp` blurs |
| Our templates | 6 cards, all weddings (4 real designs + `inv-floral`, `inv-veil` with a bridal veil) | The line under them says "Every template can be customised for any celebration", but no card shows one |
| Services: event grid | 9 tiles with gold line icons | The code already names a picture per event (`img: "wedding"`, `"birthday"` and so on, `page.tsx` lines 44-54), but those images do not exist, so only icons show |
| Services: tablet and phone | wedding text on the tablet, baby shower text on the phone | Good mix of events. The text is in code (see "Text to fix in code") |
| Process, Contact | plate with a blank card, gold bouquet card, dried stems | Neutral, fine for every event |
| Ornaments | gold bouquets, leaves, dried stems | Fine as the brand look; event variety comes from the pictures above |

## How to use ChatGPT

1. Open a new chat and paste the **style setup**. Send the prompts one per message in that same chat so the light and the gold stay the same.
2. Every prompt names a shape: **portrait** (1024x1536), **landscape** (1536x1024) or **square** (1024x1024).
3. If a cut-out comes back on white, reply: "Same image, transparent background, PNG."
4. If letters or numbers appear on a card or screen, reply: "Same image, remove all text and numbers."
5. Save each as PNG with the file name shown. The images are resized and converted to WebP before going into `public/landing/`.

## Style setup (paste first)

```text
I'm making images for "The Day", a premium digital invitation studio for every kind of celebration: weddings, birthdays, engagements, anniversaries, baby celebrations, parties, corporate events and cultural celebrations in Myanmar, Thailand and Taiwan.

Keep every image in one style: soft warm cream and beige palette (#fbf3ea, #f3e9dc), muted gold accents (#b8913f), natural soft window light from the left, calm and elegant, minimal luxury stationery look, matte paper and linen textures, photorealistic, high detail. One small accent colour per scene is fine (blush, sage, soft red) but keep it muted.

Never include text, letters, numbers, logos or watermarks, including on cards, screens and balloons. Cards and screens are always blank. When I ask for a cut-out, give a PNG with a fully transparent background. Reply "ready" and wait for my prompts.
```

## 1. Event pictures (new, 9 images)

For the Services grid. File names match the `img` keys already in `page.tsx`. Each one is a flat lay with a **blank invitation card** and a few props for that event, so all nine look like one set. Square.

**`wedding`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, two gold wedding rings, a few white roses and a satin ribbon. Soft light, lots of calm space.
```

**`birthday`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, a small slice of cream-frosted cake on a ceramic plate, two thin gold candles lying beside it and a little gold confetti. Elegant, grown-up, not childish.
```

**`engagement`**
```text
Square flat lay from above on cream linen: a blank cream invitation card and an open soft beige velvet ring box with a single diamond ring, a few blush petals and a gold ribbon.
```

**`anniversary`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, two crystal champagne coupes, a small stack of old photographs face down tied with twine, and a dried rose.
```

**`baby`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, a pair of tiny knitted cream baby booties, a sprig of cotton flowers and a soft sage ribbon. Gentle and warm.
```

**`party`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, a champagne coupe, a few small cream and gold balloons, gold streamers and confetti. Festive but calm.
```

**`corporate`**
```text
Square flat lay from above on beige paper: a blank cream invitation card with a thin gold border, a black fountain pen, a closed leather notebook and a single white orchid stem. Clean and professional.
```

**`cultural`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, a small cream paper lantern with a gold tassel, a few yellow padauk-style blossoms and a jasmine garland. Respectful, elegant, Southeast Asian festive feel, muted colours.
```

**`custom`**
```text
Square flat lay from above on cream linen: a blank cream invitation card, a gold wax seal stamp, a pot of gold ink, a calligraphy pen and loose ribbons in three soft colours, as if about to design something new.
```

> The page does not show these yet. The event tiles need a small code change to use them (for example the picture as the tile background, with the gold icon and name over it).

## 2. Template cards (replace the 2 wedding mock-ups)

The four real designs stay as screenshots. The two mock-up cards (`inv-floral`, `inv-veil`) become non-wedding events, so the row shows that templates work for any celebration. Portrait.

**`inv-birthday`**
```text
Portrait 2:3. A blank cream invitation card standing upright on cream linen, with soft cream and gold balloons behind it, a few gold candles and confetti at the front. The card is completely blank.
```

**`inv-baby`**
```text
Portrait 2:3. A blank cream invitation card on cream linen with a soft sage-green watercolour leaf border painted on the card edges, tiny knitted booties and cotton flowers beside it. The middle of the card is completely blank.
```

Optional, if the row grows to 9 cards:

**`inv-corporate`**
```text
Portrait 2:3. A blank cream invitation card with a thin gold border on dark taupe paper, a fountain pen and a white orchid beside it. Elegant gala feel. The card is completely blank.
```

**`inv-cultural`**
```text
Portrait 2:3. A blank cream invitation card on cream linen with small cream and gold paper lanterns hanging above it and yellow blossoms at the base. Warm festive evening light. The card is completely blank.
```

## 3. Hero

**`monitor`**, landscape, cut-out
```text
A modern silver all-in-one desktop computer with a thin white bezel, silver chin and silver stand, straight front view, square to the camera. The screen is completely blank, plain soft cream (#f6efe6), no reflections. Transparent background PNG with a soft shadow under the stand only. Landscape.
```
> A blank screen lets a sharp, real screenshot of the site be placed on it in code.

**`tablet-peony`**, portrait, screen only (the tablet frame is drawn in code). Show a birthday so the hero has three different events:
```text
Portrait 2:3, filling the whole frame edge to edge, no device: an elegant birthday scene on a warm taupe background (#b9a593): a small cream cake with two thin gold candles lit, soft bokeh light behind, gold confetti. No text or numbers.
```

**`phone`**, tall portrait, screen only. Show a baby celebration or a party:
```text
Tall portrait, filling the whole frame edge to edge, no device: three soft cream and gold balloons floating against a plain warm taupe background (#b9a593), ribbons hanging down, lots of calm empty space at the top. No text.
```

**`vase`**, portrait, cut-out (neutral, fine for every event)
```text
A small round beige ceramic vase with tall dried pampas grass leaning slightly right, front view, the whole vase visible. Transparent background PNG, portrait.
```

## 4. Services: device frames

Text for each event is written over these in code, so keep the middle empty and the decoration neutral.

**`tablet-frame`**, portrait, cut-out
```text
A black tablet standing upright, front view, rotated about 5 degrees. The screen shows a blank cream card with a thin gold arch outline and a soft watercolour green leaf garland up the left side and along the bottom of the arch. The middle of the arch is completely empty. Transparent background PNG, portrait.
```

**`phone-frame`**, tall portrait, cut-out
```text
A black smartphone, front view, rotated about 5 degrees the other way. The screen shows a blank cream card with a thin gold arch outline and a little gold confetti and two tiny balloon outlines at the bottom. The centre is completely empty. Transparent background PNG, tall portrait.
```

## 5. Process and Contact (neutral, sharper versions)

**`plate`**, landscape, cut-out
```text
Top-down photo of a rough-edged handmade beige ceramic plate with a blank cream greeting card resting on it at a slight angle, and a few stems of dried gypsophila across the left side. The card is completely blank. Cut out the plate: transparent background PNG, landscape.
```

**`dried`**, tall portrait, cut-out
```text
A small loose bunch of dried gypsophila and dried grass stems, natural beige tones, tall and airy, leaning slightly right. Transparent background PNG, tall portrait.
```

**`leaf-dried`**, tall portrait, cut-out
```text
A single tall dried botanical stem (dried eucalyptus or fern), natural beige and soft olive tones, very tall and narrow with a slight curve. Transparent background PNG, tall portrait.
```

## 6. Gold line art (brand ornaments)

These sit around every section. Florals are the brand look; one celebration set adds variety. All cut-outs, square unless noted.

**`bouq-gold`**
```text
Hand-drawn fine-line illustration in metallic gold (#b8913f): a loose bouquet of peonies and leaves tied with a ribbon bow. Single line weight, slight pen texture, no fill. Transparent background PNG, square.
```

**`bouq-line`**
```text
Same gold fine-line style: a small bouquet of three flowers with a ribbon next to a small closed envelope with a tiny heart seal. No fill. Transparent background PNG, square.
```

**`leaf-c`**, tall portrait
```text
Same gold fine-line style: one tall slender olive branch with 9 to 11 leaves, gently curving, tilted slightly right. No fill. Transparent background PNG, tall portrait.
```

**`leaf-a`**, portrait
```text
Same gold fine-line style: one short leafy sprig with 5 leaves, tilted slightly left. No fill. Transparent background PNG, portrait.
```

**`celebrate-line`** (new, optional)
```text
Same gold fine-line style: a loose cluster of three balloons with curling strings, a gift box with a bow, a champagne coupe and a few stars and confetti dots. No fill. Transparent background PNG, square.
```

## Do not generate

- **Design screenshots** (`shot-garden`, `shot-ribbon`, `shot-renewal`, `shot-scrapbook`): capture them from the running site at 2x.
- **Icons** (event, feature, process, contact): already drawn in code as vectors.

## Text to fix in code (not images)

The mock invitations in the Services section have placeholder mistakes that visitors will read:

- Tablet: "Thee wedding", "Kathryn 32nd June 2024 at 3 o'clock in the morning", "Hila del Sol, Rocan, Italy", "Sophia with their families".
- Phone: "Reade and Ema", "The Grand Hotel / Hotel Stay".
- Hero eyebrow says "Template Demo".
