
-- Add content promotion capabilities to admin_content table
ALTER TABLE public.admin_content 
ADD COLUMN IF NOT EXISTS is_promoted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_priority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS promoted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS promoted_by uuid REFERENCES auth.users(id);

-- Create content promotion function for super admins
CREATE OR REPLACE FUNCTION public.promote_admin_content(
  content_id uuid,
  priority_level integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update content promotion status
  UPDATE public.admin_content 
  SET 
    is_promoted = true,
    promotion_priority = priority_level,
    promoted_at = now(),
    promoted_by = auth.uid()
  WHERE id = content_id;
  
  -- Log the promotion action
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
  VALUES (
    auth.uid(), 
    'promote_content', 
    'admin_content', 
    content_id, 
    jsonb_build_object('promotion_priority', priority_level)
  );
END;
$$;

-- Create function to unpromote content
CREATE OR REPLACE FUNCTION public.unpromote_admin_content(content_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update content promotion status
  UPDATE public.admin_content 
  SET 
    is_promoted = false,
    promotion_priority = 0,
    promoted_at = null,
    promoted_by = null
  WHERE id = content_id;
  
  -- Log the unpromotion action
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
  VALUES (auth.uid(), 'unpromote_content', 'admin_content', content_id, null);
END;
$$;
