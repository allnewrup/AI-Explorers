-- =============================================================================
-- AI Explorers — 0004 storage buckets and policies
-- -----------------------------------------------------------------------------
-- Buckets are prepared for the media the product will need. No upload screen
-- exists yet in this phase; administrators upload through the Supabase
-- dashboard and paste the object path into the lesson editor.
--
--   world-illustrations  public   artwork for learning worlds
--   lesson-thumbnails    public   lesson card images
--   avatars              public   avatar artwork (never photos of children)
--   educational-images   public   approved images used inside lessons
--   lesson-media         PRIVATE  lesson video and caption (.vtt) files;
--                                 served through short-lived signed URLs
--
-- Public buckets hold only non-personal, admin-approved artwork. SVG is not
-- an allowed type because it can carry scripts.
--
-- Large or high-traffic video should move to a dedicated video host; the
-- 50 MB limit below is a deliberate nudge in that direction.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('world-illustrations', 'world-illustrations', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('lesson-thumbnails', 'lesson-thumbnails', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/png', 'image/webp']),
  ('educational-images', 'educational-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('lesson-media', 'lesson-media', false, 52428800, array['video/mp4', 'video/webm', 'text/vtt'])
on conflict (id) do nothing;

-- Only administrators may add, replace or remove files in any content bucket.
create policy "content buckets: admins insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('world-illustrations', 'lesson-thumbnails', 'avatars', 'educational-images', 'lesson-media')
    and (select app_private.is_admin())
  );

create policy "content buckets: admins update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('world-illustrations', 'lesson-thumbnails', 'avatars', 'educational-images', 'lesson-media')
    and (select app_private.is_admin())
  )
  with check (
    bucket_id in ('world-illustrations', 'lesson-thumbnails', 'avatars', 'educational-images', 'lesson-media')
    and (select app_private.is_admin())
  );

create policy "content buckets: admins delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('world-illustrations', 'lesson-thumbnails', 'avatars', 'educational-images', 'lesson-media')
    and (select app_private.is_admin())
  );

create policy "content buckets: admins read" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('world-illustrations', 'lesson-thumbnails', 'avatars', 'educational-images', 'lesson-media')
    and (select app_private.is_admin())
  );

-- Signed-in users may read a private media file only while a lesson they are
-- allowed to see points at it. The sub-select on lessons is filtered by the
-- lessons RLS policy, so media of draft lessons stays unreachable.
create policy "lesson-media: readable when attached to a visible lesson" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lesson-media'
    and exists (
      select 1
      from public.lessons l
      where l.video_asset_key = storage.objects.name
         or l.captions_asset_key = storage.objects.name
    )
  );
