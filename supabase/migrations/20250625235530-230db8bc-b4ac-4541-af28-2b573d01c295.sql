
-- Ensure the posts storage bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/mov']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own posts" ON storage.objects;

-- Create comprehensive storage policies for posts bucket
CREATE POLICY "Public can view posts" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload to posts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own posts" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own posts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
