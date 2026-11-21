# THE DAY

Bilingual (Burmese / English) digital wedding invitations by Bright Labs. A guest opens a personal link, taps the seal on an animated sleeve, and sees the invitation: cover, message, programme, countdown, photo album, gift QR codes, optional music and a wishes wall. Couples are managed from a small admin area.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind 4, Motion and Supabase (Postgres, Auth, Storage).

## Guest links

```
/w/<wedding-slug>?g=<guest-token>&lang=my|en
```

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
| `pnpm seed:admin` | Create or reset the local dev admin (local Supabase only) |
| `pnpm check:db` | Sanity-check the database setup |

## Admin

`/admin` (email + password). Per wedding:

- **Guests**: add guests, copy their Burmese or English link, see who has opened.
- **Details**: names, messages, family lineage, draft/published, wish settings.
- **Events**: ceremony and reception times (entered in the wedding's timezone), venues, maps links.
- **Media**: photos (max 8, cover, order), gift QR codes (display only), background music.
- **Wishes**: hide or show individual wishes.

An account can use the admin only if it has a row in `admin_users`.

## How it is put together

- `supabase/migrations/` holds the schema. Tables are admin-only under Row Level Security; guests reach data only through four `SECURITY DEFINER` functions (`get_invitation`, `mark_invitation_opened`, `get_wishes`, `submit_wish`) that check the guest token.
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
