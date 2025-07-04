-- CRITICAL SECURITY FIX: Clean up conflicting RLS policies

-- 1. Clean up duplicate and conflicting profile policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

-- Keep only secure profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins manage all profiles" ON public.profiles 
FOR ALL USING (is_admin());

-- 2. Fix subscription policies - remove overly permissive ones
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Replace with secure policies
CREATE POLICY "Users can manage own subscription" ON public.subscribers 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "System can create subscriptions" ON public.subscribers 
FOR INSERT WITH CHECK (true);

-- 3. Clean up posts policies - remove redundant ones
DROP POLICY IF EXISTS "Everyone can view active posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view active posts" ON public.posts;

-- Keep only necessary posts policies
CREATE POLICY "Users can view published posts" ON public.posts 
FOR SELECT USING (payment_status = 'paid' AND expires_at > now());

CREATE POLICY "Service providers can manage own posts" ON public.posts 
FOR ALL USING (auth.uid() = provider_id AND is_service_provider());

CREATE POLICY "Admins can manage all posts" ON public.posts 
FOR ALL USING (is_admin());