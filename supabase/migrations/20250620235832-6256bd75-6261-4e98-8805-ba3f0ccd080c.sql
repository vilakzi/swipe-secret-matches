
-- Create storage bucket for posts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for posts bucket
CREATE POLICY "Allow authenticated users to upload posts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Allow users to update their own posts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own posts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
