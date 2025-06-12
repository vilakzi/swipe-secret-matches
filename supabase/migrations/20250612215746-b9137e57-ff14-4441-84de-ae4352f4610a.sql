
-- Add new columns to admin_content table for enhanced features (skip enum creation)
ALTER TABLE public.admin_content 
ADD COLUMN IF NOT EXISTS category content_category DEFAULT 'other',
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS original_file_size INTEGER,
ADD COLUMN IF NOT EXISTS optimized_file_sizes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_published BOOLEAN DEFAULT false;

-- Create content_tags table for flexible tagging system
CREATE TABLE IF NOT EXISTS public.content_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.admin_content(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_approvals table for tracking approval workflow
CREATE TABLE IF NOT EXISTS public.content_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.admin_content(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_tags (drop if exists first)
DROP POLICY IF EXISTS "Admins can manage all content tags" ON public.content_tags;
DROP POLICY IF EXISTS "Users can view published content tags" ON public.content_tags;

CREATE POLICY "Admins can manage all content tags" 
  ON public.content_tags 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Users can view published content tags" 
  ON public.content_tags 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_content 
      WHERE id = content_id 
      AND status = 'published' 
      AND visibility = 'public'
    )
  );

-- RLS policies for content_approvals (drop if exists first)
DROP POLICY IF EXISTS "Admins can manage all content approvals" ON public.content_approvals;

CREATE POLICY "Admins can manage all content approvals" 
  ON public.content_approvals 
  FOR ALL 
  USING (public.is_admin());

-- Update the existing admin_content RLS policies to include approval status
DROP POLICY IF EXISTS "Users can view published content" ON public.admin_content;
DROP POLICY IF EXISTS "Users can view published and approved content" ON public.admin_content;

CREATE POLICY "Users can view published and approved content" 
  ON public.admin_content 
  FOR SELECT 
  USING (
    status = 'published' 
    AND visibility = 'public' 
    AND approval_status = 'approved'
  );
