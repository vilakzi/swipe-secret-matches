
-- Create superadmin_sessions table for secure admin authentication
CREATE TABLE public.superadmin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create admin_content table for content management
CREATE TABLE public.admin_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_analytics table for tracking engagement
CREATE TABLE public.content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.admin_content(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'like', 'share', 'comment', 'download')),
  value INTEGER NOT NULL DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on all tables
ALTER TABLE public.superadmin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for superadmin_sessions (only admins can access their own sessions)
CREATE POLICY "Admins can manage their own sessions" 
  ON public.superadmin_sessions 
  FOR ALL 
  USING (auth.uid() = admin_id);

-- RLS policies for admin_content (only admins can manage content)
CREATE POLICY "Admins can manage all content" 
  ON public.admin_content 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Users can view published content" 
  ON public.admin_content 
  FOR SELECT 
  USING (status = 'published' AND visibility = 'public');

-- RLS policies for content_analytics (admins can view all, users can view public content analytics)
CREATE POLICY "Admins can view all analytics" 
  ON public.content_analytics 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Users can view public content analytics" 
  ON public.content_analytics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_content 
      WHERE id = content_id 
      AND status = 'published' 
      AND visibility = 'public'
    )
  );

-- Function to update view count
CREATE OR REPLACE FUNCTION public.increment_content_view(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_content 
  SET view_count = view_count + 1 
  WHERE id = content_id;
  
  INSERT INTO public.content_analytics (content_id, metric_type, user_id)
  VALUES (content_id, 'view', auth.uid());
END;
$$;

-- Function to get content analytics summary
CREATE OR REPLACE FUNCTION public.get_content_analytics_summary()
RETURNS TABLE (
  total_content BIGINT,
  total_views BIGINT,
  total_likes BIGINT,
  total_shares BIGINT,
  published_content BIGINT,
  draft_content BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) as total_content,
    COALESCE(SUM(view_count), 0) as total_views,
    COALESCE(SUM(like_count), 0) as total_likes,
    COALESCE(SUM(share_count), 0) as total_shares,
    COUNT(*) FILTER (WHERE status = 'published') as published_content,
    COUNT(*) FILTER (WHERE status = 'draft') as draft_content
  FROM public.admin_content;
$$;
