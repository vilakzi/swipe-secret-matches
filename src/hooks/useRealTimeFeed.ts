
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseRealTimeFeedProps {
  onNewPost?: () => void;
  onPostUpdate?: () => void;
  onPostDelete?: () => void;
}

export const useRealTimeFeed = ({
  onNewPost,
  onPostUpdate,
  onPostDelete
}: UseRealTimeFeedProps = {}) => {
  
  const handleNewPost = useCallback(() => {
    console.log('📡 New post detected, refreshing feed...');
    if (onNewPost) {
      onNewPost();
    }
    toast({
      title: "New content available!",
      description: "Fresh posts have been added to your feed",
    });
  }, [onNewPost]);

  const handlePostUpdate = useCallback(() => {
    console.log('📡 Post updated, refreshing feed...');
    if (onPostUpdate) {
      onPostUpdate();
    }
  }, [onPostUpdate]);

  const handlePostDelete = useCallback(() => {
    console.log('📡 Post deleted, refreshing feed...');
    if (onPostDelete) {
      onPostDelete();
    }
  }, [onPostDelete]);

  useEffect(() => {
    // Set up real-time subscription for posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📡 New post inserted:', payload);
          handleNewPost();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📡 Post updated:', payload);
          handlePostUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📡 Post deleted:', payload);
          handlePostDelete();
        }
      )
      .subscribe();

    console.log('📡 Real-time feed subscription active');

    return () => {
      console.log('📡 Cleaning up real-time feed subscription');
      supabase.removeChannel(channel);
    };
  }, [handleNewPost, handlePostUpdate, handlePostDelete]);

  return {
    // Can expose additional methods if needed
  };
};
