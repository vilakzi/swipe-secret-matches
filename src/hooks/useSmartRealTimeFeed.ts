
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useContentQueue } from './useContentQueue';
import { useUserActivity } from './useUserActivity';

interface UseSmartRealTimeFeedOptions {
  onNewContent?: (count: number) => void;
  enableRealTime?: boolean;
}

export const useSmartRealTimeFeed = (options: UseSmartRealTimeFeedOptions = {}) => {
  const { onNewContent, enableRealTime = true } = options;
  const { addToQueue, queueCount, showQueueIndicator } = useContentQueue();
  const { shouldAllowAutoRefresh } = useUserActivity();

  const handleNewPost = useCallback((payload: any) => {
    console.log('📡 New post detected (queued):', payload);
    
    // Transform payload to FeedItem format
    const newItem = {
      id: payload.new.id,
      type: 'post' as const,
      profile: {
        id: payload.new.provider_id,
        name: 'New User', // Will be populated when consumed
        age: 25,
        image: '/placeholder.svg',
        bio: '',
        whatsapp: '',
        location: '',
        userType: 'service_provider' as const,
        isRealAccount: true,
        posts: []
      },
      postImage: payload.new.content_url,
      caption: payload.new.caption,
      createdAt: payload.new.created_at,
      isAdminCard: false
    };

    // Add to queue instead of immediate refresh
    addToQueue([newItem], 'new_post');
    onNewContent?.(queueCount + 1);
  }, [addToQueue, onNewContent, queueCount]);

  const handlePostUpdate = useCallback((payload: any) => {
    console.log('📡 Post updated (queued):', payload);
    // For updates, we could refresh more subtly or ignore minor updates
  }, []);

  const handleNewProfile = useCallback((payload: any) => {
    console.log('📡 New profile detected (queued):', payload);
    
    const newProfileItem = {
      id: `profile-${payload.new.id}`,
      type: 'profile' as const,
      profile: {
        id: payload.new.id,
        name: payload.new.display_name || 'New User',
        age: payload.new.age || 25,
        image: payload.new.profile_image_url || '/placeholder.svg',
        bio: payload.new.bio || '',
        whatsapp: payload.new.whatsapp || '',
        location: payload.new.location || '',
        userType: payload.new.user_type as any || 'user',
        isRealAccount: true,
        posts: [],
        joinDate: payload.new.created_at
      },
      createdAt: payload.new.created_at,
      isAdminCard: false
    };

    addToQueue([newProfileItem], 'new_profile');
    onNewContent?.(queueCount + 1);
  }, [addToQueue, onNewContent, queueCount]);

  useEffect(() => {
    if (!enableRealTime) return;

    console.log('📡 Setting up smart real-time feed subscriptions');

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('smart-posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        handleNewPost
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        handlePostUpdate
      )
      .subscribe();

    // Subscribe to new profiles
    const profilesChannel = supabase
      .channel('smart-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        handleNewProfile
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up smart real-time subscriptions');
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [enableRealTime, handleNewPost, handlePostUpdate, handleNewProfile]);

  return {
    queueCount,
    showQueueIndicator,
    shouldAllowAutoRefresh
  };
};
