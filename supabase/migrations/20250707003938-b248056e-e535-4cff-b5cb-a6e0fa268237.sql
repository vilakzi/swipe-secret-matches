
-- Create user_preferences table for matching criteria
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  min_age INTEGER DEFAULT 18 CHECK (min_age >= 18 AND min_age <= 100),
  max_age INTEGER DEFAULT 50 CHECK (max_age >= 18 AND max_age <= 100),
  max_distance INTEGER DEFAULT 50 CHECK (max_distance > 0 AND max_distance <= 500),
  show_me TEXT DEFAULT 'everyone' CHECK (show_me IN ('everyone', 'men', 'women', 'service_providers')),
  location_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id),
  CONSTRAINT valid_age_range CHECK (min_age <= max_age)
);

-- Create swipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Create super_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.super_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  is_super_like BOOLEAN DEFAULT false,
  UNIQUE(user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT ordered_user_ids CHECK (user1_id < user2_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for swipes
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.swipes;
CREATE POLICY "Users can create their own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for super_likes
DROP POLICY IF EXISTS "Users can send super likes" ON public.super_likes;
DROP POLICY IF EXISTS "Users can view super likes they sent or received" ON public.super_likes;
CREATE POLICY "Users can send super likes" ON public.super_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view super likes they sent or received" ON public.super_likes
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- RLS Policies for matches
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "System can create matches" ON public.matches;
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create matches" ON public.matches
  FOR INSERT WITH CHECK (true);

-- Function to check and create matches when users like each other
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a like
  IF NEW.liked = true THEN
    -- Check if the target user also liked this user
    IF EXISTS (
      SELECT 1 FROM public.swipes 
      WHERE user_id = NEW.target_user_id 
      AND target_user_id = NEW.user_id 
      AND liked = true
    ) THEN
      -- Create a match if it doesn't exist
      INSERT INTO public.matches (user1_id, user2_id, is_super_like)
      VALUES (
        LEAST(NEW.user_id, NEW.target_user_id),
        GREATEST(NEW.user_id, NEW.target_user_id),
        EXISTS(SELECT 1 FROM public.super_likes WHERE user_id = NEW.user_id AND target_user_id = NEW.target_user_id)
      )
      ON CONFLICT DO NOTHING;
      
      -- Create notifications for both users
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES 
        (NEW.user_id, 'match', 'New Match!', 'You have a new match', jsonb_build_object('match_user_id', NEW.target_user_id)),
        (NEW.target_user_id, 'match', 'New Match!', 'You have a new match', jsonb_build_object('match_user_id', NEW.user_id));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic match creation
DROP TRIGGER IF EXISTS trigger_check_and_create_match ON public.swipes;
CREATE TRIGGER trigger_check_and_create_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.check_and_create_match();

-- Function to clean up expired matches
CREATE OR REPLACE FUNCTION public.cleanup_expired_matches()
RETURNS void AS $$
BEGIN
  DELETE FROM public.matches 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON public.swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON public.swipes(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_expires_at ON public.matches(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
