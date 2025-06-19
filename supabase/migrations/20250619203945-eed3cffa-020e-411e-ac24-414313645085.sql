
-- Create only the post_likes table since content_analytics already exists
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes table
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_likes
CREATE POLICY "Users can view all post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Add missing columns to existing content_analytics table
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS total_users INTEGER DEFAULT 0;
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS total_subscribers INTEGER DEFAULT 0;
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS active_users_7d INTEGER DEFAULT 0;
ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0;
