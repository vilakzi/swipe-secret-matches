
import { supabase } from '@/integrations/supabase/client';
import { handleApiError, getCurrentUserId } from './apiHelpers';

export const swipeApi = {
  async createSwipe(targetUserId: string, liked: boolean) {
    const userId = await getCurrentUserId();

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
