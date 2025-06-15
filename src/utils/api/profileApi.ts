
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from './apiHelpers';

export const profileApi = {
  async getProfile(userId: string) {
    const { requireAuth } = await import('@/utils/authorizationUtils');
    await requireAuth();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw handleApiError(error);
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { requireAuth, logSensitiveOperation } = await import('@/utils/authorizationUtils');
    const context = await requireAuth();

    // Ensure user can only update their own profile (unless admin)
    if (context.userId !== userId && context.role !== 'admin') {
      throw new Error('Unauthorized: Cannot update another user\'s profile');
    }

    await logSensitiveOperation('profile_update', 'profiles', userId, null, updates);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw handleApiError(error);
    return data;
  },

  async getProfiles(filters: {
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
    showMe?: string;
    excludeIds?: string[];
  } = {}) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_blocked', false);

    if (filters.minAge) {
      query = query.gte('age', filters.minAge);
    }
    if (filters.maxAge) {
      query = query.lte('age', filters.maxAge);
    }
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      query = query.not('id', 'in', `(${filters.excludeIds.join(',')})`);
    }

    const { data, error } = await query.limit(50);

    if (error) throw handleApiError(error);
    return data || [];
  }
};
