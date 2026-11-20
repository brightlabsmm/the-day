-- THE DAY — initial schema
-- Translatable text is stored as jsonb: {"my": "...", "en": "..."}.
-- Guests never touch tables directly: they use the SECURITY DEFINER functions
-- at the bottom of this file, which check the guest's invitation token.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- admin_users: which auth users may use the dashboard
-- ─────────────────────────────────────────────────────────────

create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- weddings
-- ─────────────────────────────────────────────────────────────

create table public.weddings (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  status            text not null default 'draft' check (status in ('draft', 'published')),
  template_key      text not null default 'classic',

  partner_one_name  jsonb not null,            -- {my, en}
  partner_two_name  jsonb not null,            -- {my, en}
  monogram          text,                      -- e.g. "T&M"
  tagline           jsonb not null default '{}',
  invitation_text   jsonb not null default '{}',
  -- Optional family lineage block, per partner:
  -- {"partner_one": {"lineage": {my,en}, "credentials": "B.E.(Civil)"}, "partner_two": {...}}
  family            jsonb not null default '{}',
  note              jsonb not null default '{}',  -- dashed-box note on the details card
  closing_quote     jsonb not null default '{}',
  -- Display-only gift QR codes: [{"label": "KBZPay", "account_name": "...", "qr_path": "..."}]
  gift_methods      jsonb not null default '[]' check (jsonb_typeof(gift_methods) = 'array'),

  music_path        text,
  music_title       text,
  theme             jsonb not null default '{}',
  timezone          text not null default 'Asia/Yangon',

  wishes_enabled    boolean not null default true,
  wishes_editable   boolean not null default true,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger weddings_updated_at before update on public.weddings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- wedding_events: ceremony, reception, ...
-- ─────────────────────────────────────────────────────────────

create table public.wedding_events (
  id                 uuid primary key default gen_random_uuid(),
  wedding_id         uuid not null references public.weddings (id) on delete cascade,
  kind               text not null default 'ceremony'
                     check (kind in ('ceremony', 'reception', 'other')),
  title              jsonb not null default '{}',
  starts_at          timestamptz not null,
  ends_at            timestamptz check (ends_at is null or ends_at > starts_at),
  myanmar_date_text  jsonb not null default '{}',  -- entered by admin, never computed
  venue_name         jsonb not null default '{}',
  venue_address      jsonb not null default '{}',
  map_url            text check (map_url is null or map_url ~ '^https://'),
  sort_order         int not null default 0,
  created_at         timestamptz not null default now()
);

create index wedding_events_wedding_idx on public.wedding_events (wedding_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- wedding_photos (max 8 per wedding)
-- ─────────────────────────────────────────────────────────────

create table public.wedding_photos (
  id            uuid primary key default gen_random_uuid(),
  wedding_id    uuid not null references public.weddings (id) on delete cascade,
  storage_path  text not null,
  width         int not null check (width > 0),
  height        int not null check (height > 0),
  kind          text not null default 'couple'
                check (kind in ('portrait', 'couple', 'traditional', 'spread')),
  alt           jsonb not null default '{}',
  is_cover      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index wedding_photos_wedding_idx on public.wedding_photos (wedding_id, sort_order);
create unique index wedding_photos_one_cover on public.wedding_photos (wedding_id) where is_cover;

create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.wedding_photos where wedding_id = new.wedding_id) >= 8 then
    raise exception 'A wedding can have at most 8 photos';
  end if;
  return new;
end;
$$;

create trigger wedding_photos_limit before insert on public.wedding_photos
  for each row execute function public.enforce_photo_limit();

-- ─────────────────────────────────────────────────────────────
-- guests
-- ─────────────────────────────────────────────────────────────

create table public.guests (
  id               uuid primary key default gen_random_uuid(),
  wedding_id       uuid not null references public.weddings (id) on delete cascade,
  display_name     text not null check (length(btrim(display_name)) between 1 and 80),
  display_name_my  text check (display_name_my is null or length(display_name_my) <= 80),
  phone            text,
  group_name       text,
  -- readable name + random suffix, e.g. "ko-aung-7k2f"
  token            text not null unique check (token ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  opened_at        timestamptz,
  created_at       timestamptz not null default now()
);

create index guests_wedding_idx on public.guests (wedding_id);

-- ─────────────────────────────────────────────────────────────
-- wishes (one per guest; shown on the public wishes wall)
-- ─────────────────────────────────────────────────────────────

create table public.wishes (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references public.weddings (id) on delete cascade,
  guest_id     uuid not null unique references public.guests (id) on delete cascade,
  author_name  text not null check (length(btrim(author_name)) between 1 and 80),
  message      text not null check (length(btrim(message)) between 1 and 500),
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index wishes_wedding_idx on public.wishes (wedding_id, created_at desc);

create trigger wishes_updated_at before update on public.wishes
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: admins only. Guests go through the functions below.
-- ─────────────────────────────────────────────────────────────

alter table public.admin_users    enable row level security;
alter table public.weddings       enable row level security;
alter table public.wedding_events enable row level security;
alter table public.wedding_photos enable row level security;
alter table public.guests         enable row level security;
alter table public.wishes         enable row level security;

create policy "admins read admin_users" on public.admin_users
  for select to authenticated using ((select public.is_admin()));

create policy "admins manage weddings" on public.weddings
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage events" on public.wedding_events
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage photos" on public.wedding_photos
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage guests" on public.guests
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage wishes" on public.wishes
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────
-- Guest-facing functions
-- ─────────────────────────────────────────────────────────────

-- Returns the invitation for a published wedding (admins can preview drafts).
-- The guest block is filled only when the token belongs to this wedding.
create or replace function public.get_invitation(p_slug text, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  w public.weddings;
  g public.guests;
begin
  select * into w from public.weddings where slug = p_slug;
  if not found or (w.status <> 'published' and not public.is_admin()) then
    return null;
  end if;

  if p_token is not null then
    select * into g from public.guests where token = p_token and wedding_id = w.id;
  end if;

  return jsonb_build_object(
    'wedding', jsonb_build_object(
      'id', w.id, 'slug', w.slug, 'status', w.status, 'template_key', w.template_key,
      'partner_one_name', w.partner_one_name, 'partner_two_name', w.partner_two_name,
      'monogram', w.monogram, 'tagline', w.tagline, 'invitation_text', w.invitation_text,
      'family', w.family, 'note', w.note, 'closing_quote', w.closing_quote,
      'gift_methods', w.gift_methods, 'music_path', w.music_path, 'music_title', w.music_title,
      'theme', w.theme, 'timezone', w.timezone,
      'wishes_enabled', w.wishes_enabled, 'wishes_editable', w.wishes_editable
    ),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'kind', e.kind, 'title', e.title,
        'starts_at', e.starts_at, 'ends_at', e.ends_at,
        'myanmar_date_text', e.myanmar_date_text,
        'venue_name', e.venue_name, 'venue_address', e.venue_address, 'map_url', e.map_url
      ) order by e.sort_order, e.starts_at)
      from public.wedding_events e where e.wedding_id = w.id
    ), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'storage_path', p.storage_path, 'width', p.width, 'height', p.height,
        'kind', p.kind, 'alt', p.alt, 'is_cover', p.is_cover
      ) order by p.sort_order)
      from public.wedding_photos p where p.wedding_id = w.id
    ), '[]'::jsonb),
    'guest', case when g.id is null then null else jsonb_build_object(
      'display_name', g.display_name, 'display_name_my', g.display_name_my
    ) end
  );
end;
$$;

-- Records the first time a guest opens their link.
create or replace function public.mark_invitation_opened(p_slug text, p_token text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.guests g
     set opened_at = now()
    from public.weddings w
   where w.slug = p_slug and w.status = 'published'
     and g.wedding_id = w.id and g.token = p_token
     and g.opened_at is null;
$$;

-- Visible wishes; only guests holding a valid token for this wedding can read them.
create or replace function public.get_wishes(p_slug text, p_token text)
returns table (author_name text, message text, created_at timestamptz, is_mine boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select ws.author_name, ws.message, ws.created_at, (gs.token = p_token) as is_mine
    from public.weddings w
    join public.guests me on me.wedding_id = w.id and me.token = p_token
    join public.wishes ws on ws.wedding_id = w.id
    join public.guests gs on gs.id = ws.guest_id
   where w.slug = p_slug
     and (w.status = 'published' or public.is_admin())
     and w.wishes_enabled
     and (not ws.is_hidden or gs.token = p_token)
   order by ws.created_at desc
   limit 200;
$$;

-- Creates or updates the guest's single wish.
create or replace function public.submit_wish(
  p_slug text, p_token text, p_author_name text, p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  w public.weddings;
  g public.guests;
  existing uuid;
  v_name text := btrim(coalesce(p_author_name, ''));
  v_msg  text := btrim(coalesce(p_message, ''));
begin
  if length(v_name) not between 1 and 80 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if length(v_msg) not between 1 and 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;

  select * into w from public.weddings where slug = p_slug and status = 'published';
  if not found or not w.wishes_enabled then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;

  select * into g from public.guests where token = p_token and wedding_id = w.id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_guest');
  end if;

  select id into existing from public.wishes where guest_id = g.id;
  if existing is not null and not w.wishes_editable then
    return jsonb_build_object('ok', false, 'error', 'already_sent');
  end if;

  insert into public.wishes (wedding_id, guest_id, author_name, message)
  values (w.id, g.id, v_name, v_msg)
  on conflict (guest_id) do update
    set author_name = excluded.author_name, message = excluded.message;

  return jsonb_build_object('ok', true, 'updated', existing is not null);
end;
$$;

-- Lock down: only the guest functions are callable without logging in.
revoke all on function public.get_invitation(text, text)         from public;
revoke all on function public.mark_invitation_opened(text, text) from public;
revoke all on function public.get_wishes(text, text)             from public;
revoke all on function public.submit_wish(text, text, text, text) from public;
revoke all on function public.is_admin()                          from public;

grant execute on function public.get_invitation(text, text)          to anon, authenticated;
grant execute on function public.mark_invitation_opened(text, text)  to anon, authenticated;
grant execute on function public.get_wishes(text, text)              to anon, authenticated;
grant execute on function public.submit_wish(text, text, text, text) to anon, authenticated;
grant execute on function public.is_admin()                          to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Storage: one public bucket for photos, music and gift QR images.
-- Paths: <wedding_id>/photos/..., <wedding_id>/music/..., <wedding_id>/gifts/...
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media', 'wedding-media', true, 15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg']
)
on conflict (id) do nothing;

create policy "admins upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'wedding-media' and (select public.is_admin()));
create policy "admins update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'wedding-media' and (select public.is_admin()));
create policy "admins delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wedding-media' and (select public.is_admin()));
