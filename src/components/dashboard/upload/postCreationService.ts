
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';
import { calculateExpiryTime, getPostType } from './uploadUtils';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';
type LocationOption = 'all' | 'soweto' | 'jhb-central' | 'pta';

export const createPostRecord = async (
  userId: string,
  contentUrl: string,
  fileType: string,
  caption: string,
  promotionType: PromotionType,
  selectedLocations: LocationOption[],
  onProgress?: (progress: number) => void
) => {
  const expiresAt = calculateExpiryTime(promotionType);
  const postType = getPostType(fileType);

  // Convert location selections to metadata
  const locationMetadata = {
    target_locations: selectedLocations.length > 0 ? selectedLocations : ['all'],
    location_specific: selectedLocations.length > 0
  };

  // Creating post record with metadata

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
      // Handle database insert error
      throw new Error(`Failed to save post: ${error.message}`);
    }

    // Add location metadata as a separate update since posts table doesn't have location fields
    // We'll store this in the user's profile or use it for filtering logic
    return { ...data, locationMetadata };
  });

  onProgress?.(100);
  // Post created successfully
  
  return postData;
};
