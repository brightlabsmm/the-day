-- Public invitations (no per-guest ?g= link) and editable cover wording.

-- Cover wording that used to be hard-coded: {corner_left, corner_right, script, footer}, each {my, en}.
alter table public.weddings
  add column cover_text    jsonb   not null default '{}',
  -- When true the wishes wall is open to everyone with the link, no guest token needed.
  add column public_wishes boolean not null default false;

-- Public wishes have no guest row.
alter table public.wishes drop constraint wishes_guest_id_key;
alter table public.wishes alter column guest_id drop not null;
create unique index wishes_one_per_guest on public.wishes (guest_id) where guest_id is not null;
-- submit_wish uses ON CONFLICT (guest_id); a partial index needs the matching predicate.
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
  on conflict (guest_id) where guest_id is not null do update
    set author_name = excluded.author_name, message = excluded.message;

  return jsonb_build_object('ok', true, 'updated', existing is not null);
end;
$$;

-- get_invitation now also returns cover_text and public_wishes.
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

-- Wishes wall for weddings with public_wishes. Hidden wishes are never returned.
create or replace function public.get_public_wishes(p_slug text)
returns table (author_name text, message text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select ws.author_name, ws.message, ws.created_at
    from public.weddings w
    join public.wishes ws on ws.wedding_id = w.id
   where w.slug = p_slug
     and w.status = 'published'
     and w.wishes_enabled and w.public_wishes
     and not ws.is_hidden
   order by ws.created_at desc
   limit 100;
$$;

-- Anyone with the link can leave a wish (no edit). A per-wedding rate limit stops floods.
create or replace function public.submit_public_wish(p_slug text, p_author_name text, p_message text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  w public.weddings;
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
  if not found or not (w.wishes_enabled and w.public_wishes) then
    return jsonb_build_object('ok', false, 'error', 'closed');
  end if;

  if (select count(*) from public.wishes
       where wedding_id = w.id and guest_id is null
         and created_at > now() - interval '10 minutes') >= 30 then
    return jsonb_build_object('ok', false, 'error', 'busy');
  end if;

  insert into public.wishes (wedding_id, guest_id, author_name, message)
  values (w.id, null, v_name, v_msg);
  return jsonb_build_object('ok', true, 'updated', false);
end;
$$;

revoke all on function public.get_public_wishes(text)                from public;
revoke all on function public.submit_public_wish(text, text, text)   from public;
grant execute on function public.get_public_wishes(text)             to anon, authenticated;
grant execute on function public.submit_public_wish(text, text, text) to anon, authenticated;
