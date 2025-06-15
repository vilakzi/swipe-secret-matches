
-- Create a new storage bucket called 'content_files', public access for server/client upload and download
insert into storage.buckets (id, name, public)
values ('content_files', 'content_files', true);

-- Policy: Allow any authenticated user to upload files to this bucket
create policy "Authenticated users can upload content files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'content_files'
    and auth.role() in ('authenticated', 'service_role')
  );

-- Policy: Allow anyone to read/download files (public bucket)
create policy "Anyone can view files in content_files"
  on storage.objects
  for select
  using (bucket_id = 'content_files');
