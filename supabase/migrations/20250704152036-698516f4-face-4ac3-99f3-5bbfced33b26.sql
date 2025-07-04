-- CRITICAL SECURITY FIX: Clean up conflicting RLS policies (Fixed)

-- 1. Drop ALL existing profile policies to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "User can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users see only own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update only own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "secure_profile_select" ON public.profiles 
FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "secure_profile_insert" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "secure_profile_update" ON public.profiles 
FOR UPDATE USING (auth.uid() = id OR is_admin());

-- 2. Clean up subscription policies
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users see own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscribers;

-- Create secure subscription policies
CREATE POLICY "secure_subscription_access" ON public.subscribers 
FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "secure_subscription_system_insert" ON public.subscribers 
FOR INSERT WITH CHECK (true);

-- 3. Clean up posts policies
DROP POLICY IF EXISTS "Everyone can view active posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view active posts" ON public.posts;
DROP POLICY IF EXISTS "Users view published posts" ON public.posts;
DROP POLICY IF EXISTS "Service providers can manage their own posts" ON public.posts;
DROP POLICY IF EXISTS "Service providers can create posts" ON public.posts;
DROP POLICY IF EXISTS "Service providers can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Service providers can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Providers manage their posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;

-- Create secure posts policies
CREATE POLICY "secure_posts_view" ON public.posts 
FOR SELECT USING (payment_status = 'paid' AND expires_at > now());

CREATE POLICY "secure_posts_manage" ON public.posts 
FOR ALL USING (
  (auth.uid() = provider_id AND is_service_provider()) OR is_admin()
);