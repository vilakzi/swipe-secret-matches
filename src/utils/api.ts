import { supabase } from '@/integrations/supabase/client';
import { logSensitiveOperation, requireAuth } from '@/utils/authorizationUtils';

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

// Helper function to get current user ID with security validation
const getCurrentUserId = async (): Promise<string> => {
  const context = await requireAuth();
  return context.userId;
};

// Profile API functions with enhanced security
export const profileApi = {
  async getProfile(userId: string) {
    await requireAuth(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw handleApiError(error);
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const context = await requireAuth();
    
    // Ensure user can only update their own profile (unless admin)
    if (context.userId !== userId && context.role !== 'admin') {
      throw new Error('Unauthorized: Cannot update another user\'s profile');
    }

    // Log sensitive operation
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

// Swipe API functions with enhanced security
export const swipeApi = {
  async createSwipe(targetUserId: string, liked: boolean) {
    const userId = await getCurrentUserId();
    
    // Prevent self-swiping
    if (userId === targetUserId) {
      throw new Error('Cannot swipe on your own profile');
    }
    
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
    
    // Prevent self-super-liking
    if (userId === targetUserId) {
      throw new Error('Cannot super like your own profile');
    }
    
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

// Matches API functions with enhanced security
export const matchApi = {
  async getMatches() {
    await requireAuth(); // Ensure user is authenticated
    
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

// Block/Report API functions with enhanced security
export const moderationApi = {
  async blockUser(userId: string) {
    const blockerId = await getCurrentUserId();
    
    // Prevent self-blocking
    if (blockerId === userId) {
      throw new Error('Cannot block yourself');
    }

    // Log sensitive operation
    await logSensitiveOperation('user_blocked', 'blocked_users', userId);
    
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
    
    // Prevent self-reporting
    if (reporterId === userId) {
      throw new Error('Cannot report yourself');
    }

    // Log sensitive operation
    await logSensitiveOperation('user_reported', 'user_reports', userId, null, { reason, description });
    
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
