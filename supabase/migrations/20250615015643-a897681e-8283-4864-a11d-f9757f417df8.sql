
-- Remove messages table and all related Row Level Security (RLS) policies

-- 1. Drop RLS policies (if any remain)
DROP POLICY IF EXISTS "Users access their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
DROP POLICY IF EXISTS "Users update their sent messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their sent messages" ON public.messages;

-- 2. Drop the messages table itself (this also deletes all messages)
DROP TABLE IF EXISTS public.messages CASCADE;
