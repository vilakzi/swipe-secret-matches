
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './apiHelpers';

export const matchApi = {
  async getMatches() {
    const { requireAuth } = await import('@/utils/authorizationUtils');
    await requireAuth();
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        profiles!matches_user1_id_fkey(*),
        profiles!matches_user2_id_fkey(*)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw handleApiError(error);
    return data || [];
  }
};
