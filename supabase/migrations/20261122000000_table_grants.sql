-- Hosted Supabase projects no longer grant the API roles access to new tables
-- in public by default (the local stack still does). Grant what the app needs:
--   service_role  - server scripts and server-side admin code (bypasses RLS)
--   authenticated - the admin UI; row level security limits it to is_admin()
-- anon gets nothing here: guests only use the SECURITY DEFINER functions.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to service_role, authenticated;
grant usage, select on all sequences in schema public to service_role, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to service_role, authenticated;
