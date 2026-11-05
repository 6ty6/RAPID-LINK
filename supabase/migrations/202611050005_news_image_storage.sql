-- Public news-image storage with writes restricted to approved content admins.
-- SVG files are intentionally excluded because active content can be embedded
-- in SVG documents. The editor also enforces the same type and size limits.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'news-images',
  'news-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Content admins can upload news images" on storage.objects;
create policy "Content admins can upload news images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'news-images'
  and public.is_content_admin()
);

drop policy if exists "Content admins can update news images" on storage.objects;
create policy "Content admins can update news images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'news-images'
  and public.is_content_admin()
)
with check (
  bucket_id = 'news-images'
  and public.is_content_admin()
);

drop policy if exists "Content admins can delete news images" on storage.objects;
create policy "Content admins can delete news images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'news-images'
  and public.is_content_admin()
);
