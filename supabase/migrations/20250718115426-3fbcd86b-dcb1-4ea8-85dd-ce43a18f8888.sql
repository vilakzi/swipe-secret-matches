-- ===============================================
-- PHASE 2: Row Level Security (RLS) Policies
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Create security functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin());

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.is_admin());

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view active posts" ON public.posts
FOR SELECT USING (expires_at > now());

CREATE POLICY "Service providers can manage their own posts" ON public.posts
FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all posts" ON public.posts
FOR ALL USING (public.is_admin());

-- Swipes policies
CREATE POLICY "Users can manage their own swipes" ON public.swipes
FOR ALL USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON public.matches
FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches" ON public.matches
FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Super likes policies
CREATE POLICY "Users can manage their own super likes" ON public.super_likes
FOR ALL USING (auth.uid() = user_id);

-- Blocked users policies
CREATE POLICY "Users can manage their own blocks" ON public.blocked_users
FOR ALL USING (auth.uid() = blocker_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Users can view post likes" ON public.post_likes
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.post_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.post_likes
FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Users can view comments" ON public.post_comments
FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.post_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.post_comments
FOR DELETE USING (auth.uid() = user_id);

-- Post payments policies
CREATE POLICY "Service providers can view their own payments" ON public.post_payments
FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Service providers can create payments" ON public.post_payments
FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Admins can view all payments" ON public.post_payments
FOR SELECT USING (public.is_admin());

-- Subscribers policies
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscribers
FOR SELECT USING (public.is_admin());

-- Admin content policies
CREATE POLICY "Everyone can view published content" ON public.admin_content
FOR SELECT USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Admins can manage all content" ON public.admin_content
FOR ALL USING (public.is_admin());

-- Content tags policies
CREATE POLICY "Everyone can view content tags" ON public.content_tags
FOR SELECT USING (true);

CREATE POLICY "Admins can manage content tags" ON public.content_tags
FOR ALL USING (public.is_admin());

-- Content approvals policies
CREATE POLICY "Admins can manage content approvals" ON public.content_approvals
FOR ALL USING (public.is_admin());

-- Content analytics policies
CREATE POLICY "Admins can view content analytics" ON public.content_analytics
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert analytics" ON public.content_analytics
FOR INSERT WITH CHECK (true);

-- User reports policies
CREATE POLICY "Users can create reports" ON public.user_reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.user_reports
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update reports" ON public.user_reports
FOR UPDATE USING (public.is_admin());

-- Audit log policies
CREATE POLICY "Admins can view audit logs" ON public.audit_log
FOR SELECT USING (public.is_admin());

-- Superadmin sessions policies
CREATE POLICY "Admins can manage their own sessions" ON public.superadmin_sessions
FOR ALL USING (auth.uid() = admin_id);

-- Daily usage policies
CREATE POLICY "Users can view their own usage" ON public.daily_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.daily_usage
FOR ALL USING (auth.uid() = user_id);