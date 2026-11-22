-- Gift invitations: a separate product from weddings.
-- A campaign is a page at /g/<slug> with twelve gifts ("blessings") that a
-- visitor unlocks one by one (lotus petals, astrolabe stars or oracle cards),
-- plus an optional sign-up form ("E-Invitation") that hands out a VIP code.
-- Translatable text is jsonb {"my": "...", "en": "..."} as elsewhere.
-- Visitors never touch tables: they use the SECURITY DEFINER functions below.

create table public.gift_campaigns (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  status             text not null default 'draft' check (status in ('draft', 'published')),
  title              jsonb not null default '{}',   -- "The Lotus Sanctuary"
  subtitle           jsonb not null default '{}',   -- "12 Sacred Launch Blessings by Master Elena"
  default_view       text not null default 'lotus' check (default_view in ('lotus', 'astrolabe', 'tarot')),
  -- Where "Redeem" sends the visitor (after copying the code). Optional.
  shop_url           text check (shop_url is null or shop_url ~ '^https://'),
  invite_enabled     boolean not null default true,
  invite_title       jsonb not null default '{}',
  invite_text        jsonb not null default '{}',
  -- Choices for "What is your soul calling for today?": [{"my": "...", "en": "..."}]
  invite_intentions  jsonb not null default '[]' check (jsonb_typeof(invite_intentions) = 'array'),
  -- Shown on the VIP pass after signing up.
  vip_code           text check (vip_code is null or vip_code ~ '^[A-Z0-9_-]{1,40}$'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger gift_campaigns_updated_at before update on public.gift_campaigns
  for each row execute function public.set_updated_at();

create table public.gift_items (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.gift_campaigns (id) on delete cascade,
  position     int not null check (position between 1 and 12),
  -- One of the icons the page knows (see src/lib/gift.ts).
  icon         text not null default 'star',
  kind         text not null default 'voucher' check (kind in ('voucher', 'audio', 'book', 'oracle')),
  category     jsonb not null default '{}',
  title        jsonb not null default '{}',
  description  jsonb not null default '{}',
  -- Extra content by kind: audio = track name + note, book = excerpt + source, oracle = button + message.
  detail_title jsonb not null default '{}',
  detail_text  jsonb not null default '{}',
  code         text check (code is null or code ~ '^[A-Z0-9_-]{1,40}$'),
  created_at   timestamptz not null default now(),
  unique (campaign_id, position)
);

create index gift_items_campaign_idx on public.gift_items (campaign_id, position);

create table public.gift_signups (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.gift_campaigns (id) on delete cascade,
  name         text not null check (length(btrim(name)) between 1 and 80),
  contact      text not null check (length(btrim(contact)) between 3 and 120),
  intention    text check (intention is null or length(intention) <= 160),
  created_at   timestamptz not null default now()
);

create index gift_signups_campaign_idx on public.gift_signups (campaign_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: admins only.
-- ─────────────────────────────────────────────────────────────

alter table public.gift_campaigns enable row level security;
alter table public.gift_items     enable row level security;
alter table public.gift_signups   enable row level security;

create policy "admins manage gift campaigns" on public.gift_campaigns
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage gift items" on public.gift_items
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage gift signups" on public.gift_signups
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant select, insert, update, delete on public.gift_campaigns, public.gift_items, public.gift_signups
  to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- Visitor-facing functions
-- ─────────────────────────────────────────────────────────────

-- A published campaign and its gifts (admins can preview drafts). Never returns sign-ups.
create or replace function public.get_gift_campaign(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c public.gift_campaigns;
begin
  select * into c from public.gift_campaigns where slug = p_slug;
  if not found or (c.status <> 'published' and not public.is_admin()) then
    return null;
  end if;

  return jsonb_build_object(
    'campaign', jsonb_build_object(
      'id', c.id, 'slug', c.slug, 'status', c.status,
      'title', c.title, 'subtitle', c.subtitle, 'default_view', c.default_view,
      'shop_url', c.shop_url, 'invite_enabled', c.invite_enabled,
      'invite_title', c.invite_title, 'invite_text', c.invite_text,
      'invite_intentions', c.invite_intentions
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'position', i.position, 'icon', i.icon, 'kind', i.kind,
        'category', i.category, 'title', i.title, 'description', i.description,
        'detail_title', i.detail_title, 'detail_text', i.detail_text, 'code', i.code
      ) order by i.position)
      from public.gift_items i where i.campaign_id = c.id
    ), '[]'::jsonb)
  );
end;
$$;

-- Sign-up from the E-Invitation form. Returns the VIP code. A per-campaign
-- rate limit stops floods; the server action adds a honeypot and a cookie cooldown.
create or replace function public.submit_gift_signup(
  p_slug text, p_name text, p_contact text, p_intention text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.gift_campaigns;
  v_name      text := btrim(coalesce(p_name, ''));
  v_contact   text := btrim(coalesce(p_contact, ''));
  v_intention text := nullif(btrim(coalesce(p_intention, '')), '');
begin
  if length(v_name) not between 1 and 80 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if length(v_contact) not between 3 and 120 then
    return jsonb_build_object('ok', false, 'error', 'invalid_contact');
  end if;
  if v_intention is not null and length(v_intention) > 160 then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;

  select * into c from public.gift_campaigns where slug = p_slug and status = 'published';
  if not found or not c.invite_enabled then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;

  if (select count(*) from public.gift_signups
       where campaign_id = c.id and created_at > now() - interval '10 minutes') >= 40 then
    return jsonb_build_object('ok', false, 'error', 'busy');
  end if;

  insert into public.gift_signups (campaign_id, name, contact, intention)
  values (c.id, v_name, v_contact, v_intention);

  return jsonb_build_object('ok', true, 'vip_code', c.vip_code);
end;
$$;

revoke all on function public.get_gift_campaign(text)                   from public;
revoke all on function public.submit_gift_signup(text, text, text, text) from public;
grant execute on function public.get_gift_campaign(text)                   to anon, authenticated;
grant execute on function public.submit_gift_signup(text, text, text, text) to anon, authenticated;
