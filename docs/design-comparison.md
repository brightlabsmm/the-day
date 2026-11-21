# Design comparison with the reference list

Nine reference e-cards were opened on a phone-sized screen and compared with our designs.
Only structure, order, opening and hero were compared. Photos, artwork, wording and code are
our own and are not copied.

| Reference | Opening | Hero | Section order | Our closest design | Status |
| --- | --- | --- | --- | --- | --- |
| Riley & Ashley | none | white page, big left-aligned names, photo above | countdown, schedule, memories, venue, good to know, RSVP, FAQ | `polaroid` (order), `editorial` (look) | order applied to `polaroid` |
| Aria & Theo | dark olive curtains lit by a spotlight on the names, open by themselves, Skip | full-screen photo, script names on the left, date and venue columns at the bottom | dress code, programme, moments, RSVP, find your seat, venue | new `spotlight` | opening, hero and order built; order also applied to `artdeco` |
| May & Jan | maroon velvet curtains, monogram crest, "Enter the theatre" | n/a | countdown, programme, dress code, gallery, venue, RSVP | `theatre` (look), `midnight` (order) | `theatre` already close; order applied to `midnight` |
| Andrew & Rachel | scratch-to-reveal circle over a scenic photo, "You are invited" | n/a | story, date, venue | `scratch` | opening rebuilt: clear cover photo, arch and ring outline, champagne scratch circle revealing the names, gold "You are invited" pill, date and venue below |
| Eden & Roc | watercolour floral arch frame | n/a | countdown, story, programme, dress code, venue, RSVP | `wildflower` (look), `lantern` (order) | order applied to `lantern`; floral-arch opening **not done** |
| Rose & King (portal) | page content not readable on inspection | | | | **not analysed** |
| Rose & Christian | sheer silk photo, Enter pill and Skip | n/a | countdown, date calendar, gallery, dress code, RSVP, find your seat, venue | `silk` | order applied to `silk` |
| Olivia & Adam | none | faded beach photo | story, venue, RSVP, what to wear, memories | `record` (look), `botanical` (order) | order applied to `botanical`; faded-photo hero **not done** |
| Rose & David | none | full-screen photo, centred names | programme, dress code, moments, RSVP, find your seat | `editorial` (look), `sunrise` (order) | order applied to `sunrise` |

## How section order works

The seven designs built on the shared page body (`silk`, `midnight`, `lantern`, `polaroid`,
`botanical`, `artdeco`, `sunrise`, plus `spotlight`) wrap their sections in `.tpl-order`, and
`src/app/templates.css` sets each section's CSS `order` per design. Older designs (`classic`,
`editorial`, `envelope`, `theatre`, `record`, `wildflower`, `shutters`, `scratch`) keep their
fixed order.

## Not done

- Watercolour floral-arch opening (Eden & Roc).
- Faded full-photo hero (Olivia & Adam).
- Rose & King portal page.
- English/Thai language switch (ours is Burmese/English).
- Section order for the older designs.
