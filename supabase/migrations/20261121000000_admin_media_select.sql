-- Storage only lets an admin remove or replace a file they can also SELECT.
-- Public reads of the bucket go through its public URLs and do not need this.
create policy "admins read media" on storage.objects
  for select to authenticated
  using (bucket_id = 'wedding-media' and (select public.is_admin()));
