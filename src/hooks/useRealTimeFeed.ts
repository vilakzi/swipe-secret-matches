
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeFeedProps {
  onNewPost?: () => void;
  onPostUpdate?: () => void;
  onPostDelete?: () => void;
  onNewProfile?: () => void;
}

export const useRealTimeFeed = ({
  onNewPost,
  onPostUpdate,
  onPostDelete,
  onNewProfile
}: UseRealTimeFeedProps = {}) => {
  
  const handleNewPost = useCallback(() => {
    console.log('📡 New post detected');
    if (onNewPost) {
      onNewPost();
    }
    toast({
      title: "New content!",
      description: "Fresh post added to feed",
    });
  }, [onNewPost]);

  const handlePostUpdate = useCallback(() => {
    console.log('📡 Post updated');
    if (onPostUpdate) {
      onPostUpdate();
    }
  }, [onPostUpdate]);

  const handlePostDelete = useCallback(() => {
    console.log('📡 Post deleted');
    if (onPostDelete) {
      onPostDelete();
    }
  }, [onPostDelete]);

  const handleNewProfile = useCallback(() => {
    console.log('📡 New profile detected');
    if (onNewProfile) {
      onNewProfile();
    }
    toast({
      title: "New member!",
      description: "Someone new joined",
    });
  }, [onNewProfile]);

  useEffect(() => {
    console.log('📡 Setting up real-time feed listeners');
    
    const channel = supabase
      .channel('feed-updates')
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
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        handlePostDelete
      )
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

    console.log('📡 Real-time listeners active');

    return () => {
      console.log('📡 Cleaning up real-time listeners');
      supabase.removeChannel(channel);
    };
  }, [handleNewPost, handlePostUpdate, handlePostDelete, handleNewProfile]);

  return {};
};
