
import { supabase } from '@/integrations/supabase/client';
import { handleApiError, getCurrentUserId } from './apiHelpers';

export const moderationApi = {
  async blockUser(userId: string) {
    const { logSensitiveOperation } = await import('@/utils/authorizationUtils');
    const blockerId = await getCurrentUserId();

    if (blockerId === userId) {
      throw new Error('Cannot block yourself');
    }
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
    const { logSensitiveOperation } = await import('@/utils/authorizationUtils');
    const reporterId = await getCurrentUserId();

    if (reporterId === userId) {
      throw new Error('Cannot report yourself');
    }
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
