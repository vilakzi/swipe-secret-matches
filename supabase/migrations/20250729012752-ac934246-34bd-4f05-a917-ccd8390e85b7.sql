-- Phase 3: Enhanced Features Database Schema

-- Stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_url TEXT NOT NULL,
  story_type TEXT NOT NULL CHECK (story_type IN ('image', 'video')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  views_count INTEGER NOT NULL DEFAULT 0
);

-- Story views table
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  post_id UUID,
  comment_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User activity table for tracking online status
CREATE TABLE public.user_activity (
  user_id UUID NOT NULL PRIMARY KEY,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Stories are viewable by followers and owner" ON public.stories FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.follows 
    WHERE following_id = stories.user_id AND follower_id = auth.uid()
  ) OR
  expires_at > now()
);

CREATE POLICY "Users can insert their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON public.stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Story views are viewable by story owner" ON public.story_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stories WHERE id = story_views.story_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their own story views" ON public.story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- User activity policies
CREATE POLICY "User activity is viewable by everyone" ON public.user_activity FOR SELECT USING (true);
CREATE POLICY "Users can insert their own activity" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activity" ON public.user_activity FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_user_activity_last_seen ON public.user_activity(last_seen_at);

-- Function to update story views count
CREATE OR REPLACE FUNCTION public.update_story_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET views_count = views_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.stories WHERE expires_at < now();
END;
$$;

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't create notification if user is acting on their own content
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
  VALUES (p_user_id, p_actor_id, p_type, p_post_id, p_comment_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Triggers
CREATE TRIGGER trigger_update_story_views_count
  AFTER INSERT ON public.story_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_views_count();

CREATE TRIGGER trigger_update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_user_activity_updated_at
  BEFORE UPDATE ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();