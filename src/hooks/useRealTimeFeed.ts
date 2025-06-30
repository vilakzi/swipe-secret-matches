
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
    console.log('📡 NEW POST: Distributing to ALL accounts immediately');
    if (onNewPost) {
      onNewPost();
    }
    toast({
      title: "Fresh content available!",
      description: "New post distributed to all feeds instantly",
    });
  }, [onNewPost]);

  const handlePostUpdate = useCallback(() => {
    console.log('📡 POST UPDATED: Refreshing all feeds with updated content');
    if (onPostUpdate) {
      onPostUpdate();
    }
  }, [onPostUpdate]);

  const handlePostDelete = useCallback(() => {
    console.log('📡 POST DELETED: Removing from all feeds immediately');
    if (onPostDelete) {
      onPostDelete();
    }
  }, [onPostDelete]);

  const handleNewProfile = useCallback(() => {
    console.log('📡 NEW PROFILE: Adding to all user feeds immediately');
    if (onNewProfile) {
      onNewProfile();
    }
    toast({
      title: "New member joined!",
      description: "Fresh profile added to your feed",
    });
  }, [onNewProfile]);

  useEffect(() => {
    console.log('📡 REAL-TIME CONTENT DISTRIBUTION: Starting universal content sync');
    
    // Set up comprehensive real-time subscription for ALL content
    const channel = supabase
      .channel('universal-content-distribution')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('📡 NEW POST DETECTED - Distributing to ALL users:', payload);
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
          console.log('📡 POST UPDATE DETECTED - Updating all feeds:', payload);
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
          console.log('📡 POST DELETION DETECTED - Removing from all feeds:', payload);
          handlePostDelete();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('📡 NEW PROFILE DETECTED - Adding to all feeds:', payload);
          handleNewProfile();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('📡 PROFILE UPDATE DETECTED - Refreshing all feeds:', payload);
          if (onPostUpdate) {
            onPostUpdate();
          }
        }
      )
      .subscribe();

    console.log('📡 UNIVERSAL CONTENT DISTRIBUTION: Active for all users');

    return () => {
      console.log('📡 Cleaning up universal content distribution');
      supabase.removeChannel(channel);
    };
  }, [handleNewPost, handlePostUpdate, handlePostDelete, handleNewProfile, onPostUpdate]);

  return {
    // Real-time distribution is active
  };
};
