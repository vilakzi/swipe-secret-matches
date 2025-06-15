
-- === RLS POLICY ENHANCEMENTS, TABLES ONLY (SKIPPING VIEWS) ===

-- Security-definer helper functions (ensure up-to-date - safe to re-run)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_service_provider()
RETURNS boolean AS $$
  SELECT public.get_current_user_role() = 'service_provider';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;


-- Enable RLS on SENSITIVE TABLES ONLY (skip all views)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_sessions ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES: owners, admins
DROP POLICY IF EXISTS "Users see only own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;
CREATE POLICY "Users see only own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update only own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- 2. MESSAGES: sender/receiver only
DROP POLICY IF EXISTS "Users access their own messages" ON public.messages;
CREATE POLICY "Users access their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. MATCHES: only own
DROP POLICY IF EXISTS "Users read their matches" ON public.matches;
CREATE POLICY "Users read their matches" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 4. POSTS: only own, or public
DROP POLICY IF EXISTS "Providers manage their posts" ON public.posts;
DROP POLICY IF EXISTS "Users view published posts" ON public.posts;
CREATE POLICY "Providers manage their posts" ON public.posts FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Users view published posts" ON public.posts FOR SELECT USING (payment_status = 'paid' AND expires_at > now());

-- 5. BLOCKED USERS: only own blocks
DROP POLICY IF EXISTS "Users block/unblock" ON public.blocked_users;
CREATE POLICY "Users block/unblock" ON public.blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- 6. SWIPES: only own
DROP POLICY IF EXISTS "Users see their own swipes" ON public.swipes;
CREATE POLICY "Users see their own swipes" ON public.swipes FOR SELECT USING (auth.uid() = user_id);

-- 7. USER REPORTS: self-reporting/insert only, all to admins
DROP POLICY IF EXISTS "Users report other users" ON public.user_reports;
DROP POLICY IF EXISTS "Admins view all reports" ON public.user_reports;
CREATE POLICY "Users report other users" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id AND reporter_id <> reported_id);
CREATE POLICY "Admins view all reports" ON public.user_reports FOR SELECT USING (public.is_admin());

-- 8. NOTIFICATIONS: only own
DROP POLICY IF EXISTS "Users see their notifications" ON public.notifications;
CREATE POLICY "Users see their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- 9. POST COMMENTS: only self
DROP POLICY IF EXISTS "Users comment as self" ON public.post_comments;
CREATE POLICY "Users comment as self" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. USER PREFERENCES: only own
DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- 11. SUPER LIKES: only own
DROP POLICY IF EXISTS "Users create super likes" ON public.super_likes;
CREATE POLICY "Users create super likes" ON public.super_likes FOR ALL USING (auth.uid() = user_id);

-- 12. AUDIT LOG: admin only
DROP POLICY IF EXISTS "Admin can view audit log" ON public.audit_log;
CREATE POLICY "Admin can view audit log" ON public.audit_log FOR SELECT USING (public.is_admin());

-- 13. ADMIN CONTENT/APPROVALS: admin only
DROP POLICY IF EXISTS "Admins manage admin_content" ON public.admin_content;
CREATE POLICY "Admins manage admin_content" ON public.admin_content FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage approvals" ON public.content_approvals;
CREATE POLICY "Admins manage approvals" ON public.content_approvals FOR ALL USING (public.is_admin());

-- 14. CONTENT ANALYTICS: admin only
DROP POLICY IF EXISTS "Admins view analytics" ON public.content_analytics;
CREATE POLICY "Admins view analytics" ON public.content_analytics FOR SELECT USING (public.is_admin());

-- 15. SUBSCRIBERS: only self, or admin
DROP POLICY IF EXISTS "Users see own subscription" ON public.subscribers;
CREATE POLICY "Users see own subscription" ON public.subscribers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all subscriptions" ON public.subscribers FOR ALL USING (public.is_admin());

-- 16. CONTENT TAGS: admin only
DROP POLICY IF EXISTS "Admins manage tags" ON public.content_tags;
CREATE POLICY "Admins manage tags" ON public.content_tags FOR ALL USING (public.is_admin());

-- 17. SUPERADMIN SESSIONS: admin only
DROP POLICY IF EXISTS "Admins manage sessions" ON public.superadmin_sessions;
CREATE POLICY "Admins manage sessions" ON public.superadmin_sessions FOR ALL USING (public.is_admin());

-- === End: Views skipped; all policies & RLS only applied to concrete tables ===
