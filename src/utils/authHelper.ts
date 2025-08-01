import { supabase } from '@/integrations/supabase/client';

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data;
};