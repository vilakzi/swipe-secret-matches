
-- Promote specific email addresses to admin role
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'thembavilakazi823@gmail.com',
    'listentotalent@gmail.com', 
    'vilakazi.pt@gmail.com'
  )
);

-- Also ensure they have admin entries in user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email IN (
  'thembavilakazi823@gmail.com',
  'listentotalent@gmail.com',
  'vilakazi.pt@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
