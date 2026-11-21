# THE DAY

Bilingual (Burmese / English) digital wedding invitations by Bright Labs. A guest opens a personal link, taps the seal on an animated sleeve, and sees the invitation: cover, message, programme, countdown, photo album, gift QR codes, optional music and a wishes wall. Couples are managed from a small admin area.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind 4, Motion and Supabase (Postgres, Auth, Storage).

## Guest links

```
/w/<wedding-slug>?g=<guest-token>&lang=my|en
```

- `g` is optional. Without it the invitation is public: "Dear Honoured Guest" on the sleeve and, if the wedding has **Open wishes wall** switched on, anyone can read and add wishes. Weddings that use personal links keep the wishes wall for guests with a valid token.
- `g` is the guest's personal token (for example `ko-aung-7k2fp3qx`). Without a valid token the invitation still opens, but without the guest's name, the wishes wall or open tracking.
- `lang` wins over the guest's saved choice (cookie). Burmese is the default.
- A guest is marked as opened when they tap the seal, not on page load, so link-preview bots do not count.
- Previews (Open Graph) show the couple's names and cover photo, never a guest name. Pages are `noindex`.

## Run it locally

Requirements: Node 22+, pnpm, Docker (for the local Supabase stack).

```bash
pnpm install
cp .env.example .env.local
pnpm db:start            # starts local Supabase
pnpm exec supabase status -o env   # copy the URL and keys into .env.local
pnpm db:reset            # applies migrations + demo seed, uploads demo photos
pnpm seed:admin          # creates a local admin (set ADMIN_EMAIL / ADMIN_PASSWORD first)
pnpm dev
```

Then open <http://localhost:3000/w/thukha-maythet?g=ko-aung-7k2f> for the demo invitation and <http://localhost:3000/admin> for the admin.

| Script | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm typecheck`, `pnpm lint`, `pnpm test` | Checks (tests use Vitest) |
| `pnpm db:start` / `db:stop` | Local Supabase |
| `pnpm db:reset` | Re-apply migrations and seed, then run `seed:media` |
| `pnpm db:types` | Regenerate `src/lib/supabase/database.types.ts` |
| `pnpm seed:media` | Upload demo photos and a placeholder gift QR |
| `pnpm seed:showcase` | Create the sixteen fictional demo weddings used by `/showcase` |
| `pnpm import:wedding <folder>` | Create or update a real wedding from `wedding.json` plus its image files (see below) |
| `pnpm seed:admin` | Create or reset the local dev admin (local Supabase only) |
| `pnpm check:db` | Sanity-check the database setup |

## Page designs

Each wedding picks a design in the admin (**Details → Page design**):

| Design | Look |
| --- | --- |
| `classic` | Printed card in a paper sleeve, gold foil names, album page |
| `editorial` | Black and white, full-screen photo, giant monogram and type |
| `envelope` | Cream envelope with a wax seal, script lettering |
| `theatre` | Velvet curtains and a spotlit stage, "Act I, II, III" programme, flip-card countdown |
| `record` | Seaside blues: a spinning vinyl record that plays the wedding song, and the story as a track-by-track player |
| `wildflower` | Peach and olive: watercolour wildflowers around the names, scalloped frames for countdown, programme, dress code and venue, arch-topped photos |
| `shutters` | Blue wooden shutters swing open (on their own, on tap, or skipped) onto a sunlit view; whitewash, bougainvillea pink, arched window-frame photos |
| `silk` | Blush silk drape lifts away from a calm ivory page: soft petals, a month calendar you can page through, boxed countdown, tap-to-expand schedule rows, rounded cards, sage green |
| `midnight` | Deep navy night sky with twinkling gold stars; tap the moon to enter, constellation divider, month calendar, glowing cards |
| `lantern` | Warm dusk of paper lanterns; tap the big lantern to release it, amber glow, plum cards |
| `polaroid` | Kraft-paper scrapbook: the cover photo develops on a polaroid you tap to open, taped tilted polaroid photos, tomato-red accents |
| `botanical` | Sage-green leaves part like a garden gate. Leafy sprigs frame the names, with a calm cream page and green accents. |
| `artdeco` | Black and gold geometry. A sunburst gate splits open to a glamorous page of fans, gold lines and bold lettering. |
| `sunrise` | A sun rises over layered peach hills to open the page. Warm coral, soft cream and a hopeful new-day feel. |
| `spotlight` | Dark velvet curtains under a spotlight open by themselves onto a full-screen photo hero with script names on the left |
| `scratch` | Rose-pink, scratch-the-heart opening, calendar and hearts |

All sixteen share the same content, Burmese/English switch, countdown, schedule, photos, gift QR codes and wishes. The four newer designs also show, when filled in on the Details tab: **Our story**, **Dress code** (colour swatches), **RSVP** (accept or decline, number of guests, note; replies on the admin **RSVPs** tab), an **FAQ** accordion, a **Good to know** grid of tips (parking, transport, weather), **Find your seat** (guests type their name and see their table; turn it on in Details and set tables on the Guests tab), and **Add to Google Calendar / .ics** buttons. They fade sections in on scroll, and schedule rows open on click to show the venue. They live in `src/components/invite` (classic) and `src/components/templates` (the others, with palettes in `src/app/templates.css`). With five or more photos, the first three go in an overlapping **collage** under "Our story" (the rest in the gallery) with an original watercolour illustration tile among them (sea and sailboat, blossoms, dusk hills or night sky; drawn in code in `art.tsx`). Each design picks its own arrangement (`collage.tsx`: mosaic, scatter or stack). `/showcase` shows all sixteen side by side using fictional demo weddings created by `pnpm seed:showcase` (generated artwork, no real people).

## Adding a real wedding

Put the couple's details and images in a folder that is **not committed** (`private/` is gitignored; it can hold family names, payment QR codes and photos), then:

```bash
pnpm import:wedding private/<couple>
```

`wedding.json` holds names, `template_key`, an optional `music` file (mp3, m4a, aac or ogg), texts (`{"my": "...", "en": "..."}`), `good_to_know`, `seating_enabled` and `guests` (`[{"name", "name_my", "table"}]`), `cover_text` (top corner labels, script line and footer printed on the card), events (times in the wedding's timezone), photos and gift QR images. The script writes to whatever `NEXT_PUBLIC_SUPABASE_URL` points at, so use `.env.local` values for the project you mean. Re-running replaces events, photos and gift images but keeps guests and wishes. QR codes photographed from print need a white margin around them to scan; check each one with a phone before publishing.

Open wishes walls rely on a honeypot field, a 30-second cooldown per browser and a limit of 30 public wishes per 10 minutes per wedding. Hide anything unwanted from the **Wishes** tab in the admin.

## Admin

`/admin` (email + password). Per wedding:

- **Guests**: add guests (with an optional table for "Find your seat"), copy their Burmese or English link, see who has opened.
- **Details**: names, messages, family lineage, draft/published, wish settings.
- **Events**: ceremony and reception times (entered in the wedding's timezone), venues, maps links.
- **Media**: photos (max 8, cover, order), gift QR codes (display only), background music.
- **Wishes**: hide or show individual wishes.

An account can use the admin only if it has a row in `admin_users`.

## How it is put together

- `supabase/migrations/` holds the schema. Tables are admin-only under Row Level Security; guests reach data only through `SECURITY DEFINER` functions (`get_invitation`, `mark_invitation_opened`, `get_wishes`, `submit_wish`, `submit_rsvp`, `find_seat`) that check the guest token or the wedding slug. `find_seat` returns only a name and table, at most six matches, and only when the couple switched seating on.
- Translatable text is stored as `{"my": "...", "en": "..."}` and read with `t()`; a missing language falls back to the other.
- `src/app/w/[slug]` is the guest page, `src/app/admin` the admin, `src/proxy.ts` refreshes the admin session. Every admin page and action re-checks the admin with `requireAdmin()`.
- Uploads go through Server Actions (limit 16 MB). Photos are decoded, auto-rotated, resized to 2400 px and re-encoded as WebP, which also strips EXIF data such as GPS location.

## Deploying

1. Create a hosted Supabase project and apply the migrations: `supabase link` then `supabase db push`. Do not run `supabase/seed.sql` or the `seed:*` scripts against production.
2. Create your admin user in the Supabase dashboard (Auth), then add them: `insert into public.admin_users (user_id) values ('<user id>');`
3. Deploy the app (for example on Vercel) with:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`: the public origin, used for link previews and copied guest links
4. Keep `SUPABASE_SECRET_KEY` out of the deployed app; it is only for local scripts.

## Notes

- The demo wedding's venue, family lineage and wording are intentionally placeholders ("TBC").
- Next.js 16 has breaking changes from older versions. See `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework-level code.
