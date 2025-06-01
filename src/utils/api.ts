
import { supabase } from '@/integrations/supabase/client';

export interface ApiError {
  message: string;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  if (error?.message) {
    return { message: error.message, code: error.code };
  }
  return { message: 'An unexpected error occurred' };
};

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

// Profile API functions
export const profileApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  },

  async updateProfile(userId: string, updates: any) {
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

// Swipe API functions
export const swipeApi = {
  async createSwipe(targetUserId: string, liked: boolean) {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        user_id: userId,
        target_user_id: targetUserId,
        liked
      })
      .select()
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  },

  async createSuperLike(targetUserId: string) {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('super_likes')
      .insert({
        user_id: userId,
        target_user_id: targetUserId
      })
      .select()
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  }
};

// Matches API functions
export const matchApi = {
  async getMatches() {
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

// Block/Report API functions
export const moderationApi = {
  async blockUser(userId: string) {
    const blockerId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_id: userId
      })
      .select()
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  },

  async reportUser(userId: string, reason: string, description?: string) {
    const reporterId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: reporterId,
        reported_id: userId,
        reason,
        description
      })
      .select()
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  }
};
