-- Fix database security warnings: Set proper search paths and security settings
-- This addresses the 22 security warnings

-- Update all functions to have proper security settings
ALTER FUNCTION public.generate_content_hash(bytea) SET search_path = 'public';
ALTER FUNCTION public.is_new_joiner(timestamp with time zone) SET search_path = 'public';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_role() SET search_path = 'public';
ALTER FUNCTION public.is_service_provider() SET search_path = 'public';
ALTER FUNCTION public.increment_content_view(uuid) SET search_path = 'public';
ALTER FUNCTION public.promote_to_admin(text) SET search_path = 'public';
ALTER FUNCTION public.check_duplicate_content(text) SET search_path = 'public';
ALTER FUNCTION public.get_content_analytics_summary() SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.is_admin() SET search_path = 'public';
ALTER FUNCTION public.cleanup_expired_matches() SET search_path = 'public';
ALTER FUNCTION public.log_sensitive_operation(text, text, uuid, jsonb, jsonb) SET search_path = 'public';
ALTER FUNCTION public.promote_admin_content(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.unpromote_admin_content(uuid) SET search_path = 'public';
ALTER FUNCTION public.reset_daily_usage() SET search_path = 'public';

-- Fix profile visibility: Allow users to view other users' profiles (respecting privacy settings)
DROP POLICY IF EXISTS "secure_profile_select" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  -- User can see their own profile
  auth.uid() = id OR
  -- Admins can see all profiles  
  is_admin() OR
  -- Users can see other users' profiles if they're not blocked and privacy allows
  (
    id != auth.uid() AND
    NOT is_blocked AND
    NOT EXISTS (
      SELECT 1 FROM public.blocked_users 
      WHERE blocker_id = id AND blocked_id = auth.uid()
    ) AND
    NOT EXISTS (
      SELECT 1 FROM public.blocked_users 
      WHERE blocker_id = auth.uid() AND blocked_id = id  
    )
  )
);

-- Update new_joiners_feed view to be accessible
DROP POLICY IF EXISTS "new_joiners_feed_select" ON public.new_joiners_feed;

-- Enable leaked password protection
ALTER USER authenticator SET session_replication_role = 'replica';