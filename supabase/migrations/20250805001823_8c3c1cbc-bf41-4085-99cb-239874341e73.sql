-- Insert missing profile for the authenticated user
INSERT INTO public.profiles (user_id, role, user_type, display_name)
VALUES ('be61f343-7f2e-40b6-91cb-77844c946b8c', 'user', 'user', 'FRICA LABS')
ON CONFLICT (user_id) DO NOTHING;