-- Optional invitation sections: dress code, FAQ, story, and RSVP replies.

alter table public.weddings
  -- {"text": {my,en}, "colors": [{"hex": "#5e1a27", "name": {my,en}}]}
  add column dress_code   jsonb   not null default '{}',
  -- [{"q": {my,en}, "a": {my,en}}]
  add column faq          jsonb   not null default '[]' check (jsonb_typeof(faq) = 'array'),
  -- [{"label": {my,en}, "title": {my,en}, "text": {my,en}}]
  add column story        jsonb   not null default '[]' check (jsonb_typeof(story) = 'array'),
  add column rsvp_enabled boolean not null default false;

create table public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  guest_id    uuid references public.guests (id) on delete set null,
  name        text not null check (length(btrim(name)) between 1 and 80),
  attending   boolean not null,
  party_size  int not null default 1 check (party_size between 1 and 10),
  note        text check (note is null or length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index rsvps_wedding_idx on public.rsvps (wedding_id, created_at desc);
-- A guest with a personal link has one reply, which they can change.
create unique index rsvps_one_per_guest on public.rsvps (guest_id) where guest_id is not null;
create trigger rsvps_updated_at before update on public.rsvps
  for each row execute function public.set_updated_at();

alter table public.rsvps enable row level security;
create policy "admins manage rsvps" on public.rsvps
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Anyone with the link can reply; a valid guest token links the reply to that guest.
create or replace function public.submit_rsvp(
  p_slug text, p_token text, p_name text, p_attending boolean, p_party_size int, p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  w public.weddings;
  g public.guests;
  v_name text := btrim(coalesce(p_name, ''));
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_size int  := coalesce(p_party_size, 1);
begin
  if length(v_name) not between 1 and 80 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if v_size not between 1 and 10 or (v_note is not null and length(v_note) > 300) then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;
  if p_attending is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;
  if not p_attending then v_size := 1; end if;

  select * into w from public.weddings where slug = p_slug and status = 'published';
  if not found or not w.rsvp_enabled then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;

  if p_token is not null then
    select * into g from public.guests where token = p_token and wedding_id = w.id;
  end if;

  if g.id is not null then
    insert into public.rsvps (wedding_id, guest_id, name, attending, party_size, note)
    values (w.id, g.id, v_name, p_attending, v_size, v_note)
    on conflict (guest_id) where guest_id is not null do update
      set name = excluded.name, attending = excluded.attending,
          party_size = excluded.party_size, note = excluded.note;
    return jsonb_build_object('ok', true, 'updated', true);
  end if;

  if (select count(*) from public.rsvps
       where wedding_id = w.id and guest_id is null
         and created_at > now() - interval '10 minutes') >= 40 then
    return jsonb_build_object('ok', false, 'error', 'busy');
  end if;
  insert into public.rsvps (wedding_id, name, attending, party_size, note)
  values (w.id, v_name, p_attending, v_size, v_note);
  return jsonb_build_object('ok', true, 'updated', false);
end;
$$;

revoke all on function public.submit_rsvp(text, text, text, boolean, int, text) from public;
grant execute on function public.submit_rsvp(text, text, text, boolean, int, text) to anon, authenticated;

-- get_invitation also returns the new optional sections.
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
      'cover_text', w.cover_text,
      'dress_code', w.dress_code, 'faq', w.faq, 'story', w.story, 'rsvp_enabled', w.rsvp_enabled,
      'gift_methods', w.gift_methods, 'music_path', w.music_path, 'music_title', w.music_title,
      'theme', w.theme, 'timezone', w.timezone,
      'wishes_enabled', w.wishes_enabled, 'wishes_editable', w.wishes_editable,
      'public_wishes', w.public_wishes
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
