
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';
import { calculateExpiryTime, getPostType } from './uploadUtils';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

export const createPostRecord = async (
  userId: string,
  contentUrl: string,
  fileType: string,
  caption: string,
  promotionType: PromotionType,
  onProgress?: (progress: number) => void
) => {
  const expiresAt = calculateExpiryTime(promotionType);
  const postType = getPostType(fileType);

  console.log('Creating post record:', {
    provider_id: userId,
    content_url: contentUrl,
    post_type: postType,
    promotion_type: promotionType
  });

  const postData = await retryOperation(async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        provider_id: userId,
        content_url: contentUrl,
        post_type: postType,
        caption: caption.trim() || null,
        promotion_type: promotionType,
        expires_at: expiresAt.toISOString(),
        is_promoted: promotionType !== 'free_2h',
        payment_status: promotionType === 'free_2h' ? 'paid' : 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to save post: ${error.message}`);
    }

    return data;
  });

  onProgress?.(100);
  console.log('Post created successfully:', postData);
  
  return postData;
};
