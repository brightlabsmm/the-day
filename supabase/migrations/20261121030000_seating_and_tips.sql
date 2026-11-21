-- Good to know tips and a "Find your seat" lookup.

alter table public.weddings
  -- [{"title": {my,en}, "text": {my,en}}]
  add column good_to_know    jsonb   not null default '[]' check (jsonb_typeof(good_to_know) = 'array'),
  add column seating_enabled boolean not null default false;

alter table public.guests
  add column table_name text check (table_name is null or length(table_name) <= 40);

-- get_invitation also returns the new fields.
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
      'good_to_know', w.good_to_know, 'seating_enabled', w.seating_enabled,
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


-- A guest types their name and sees their table. Only the name and table come back, never
-- phone numbers or links, at most six matches, and only for weddings that switched seating on.
create or replace function public.find_seat(p_slug text, p_query text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  w public.weddings;
  q text := lower(btrim(coalesce(p_query, '')));
begin
  if length(q) < 2 or length(q) > 60 then
    return '[]'::jsonb;
  end if;
  select * into w from public.weddings where slug = p_slug;
  if not found or w.status <> 'published' or not w.seating_enabled then
    return '[]'::jsonb;
  end if;
  q := replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_');
  return coalesce((
    select jsonb_agg(jsonb_build_object('name', r.display_name, 'name_my', r.display_name_my, 'table', r.table_name))
    from (
      select g.display_name, g.display_name_my, g.table_name
      from public.guests g
      where g.wedding_id = w.id
        and g.table_name is not null
        and (lower(g.display_name) like '%' || q || '%' or lower(coalesce(g.display_name_my, '')) like '%' || q || '%')
      order by g.display_name
      limit 6
    ) r
  ), '[]'::jsonb);
end;
$$;
grant execute on function public.find_seat(text, text) to anon, authenticated;
