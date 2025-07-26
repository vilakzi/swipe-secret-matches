
import React, { useState, useEffect } from 'react';

import FeedContent from '@/components/feed/FeedContent';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types/feedTypes';

const Feed = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch posts from the posts table and transform them into feed items
  const fetchFeed = async () => {
    try {
      console.log('Fetching real posts from database...');
      // Get posts with profile information
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:provider_id (
            id,
            display_name,
            bio,
            profile_image_url,
            location,
            age,
            whatsapp,
            user_type,
            role,
            created_at,
            verifications
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      console.log('Raw posts from database:', posts);

      // Transform posts into feed items
      const transformedFeedItems = posts?.map(post => {
        const profile = post.profiles;
        if (!profile) return null;

        return {
          id: post.id,
          type: 'post' as const,
          profile: {
            id: profile.id,
            name: profile.display_name || 'Unknown User',
            age: profile.age || 25,
            image: profile.profile_image_url || '/placeholder.svg',
            bio: profile.bio || '',
            whatsapp: profile.whatsapp || '',
            location: profile.location || '',
            userType: profile.user_type || 'user',
            role: profile.role,
            joinDate: profile.created_at,
            posts: [post.content_url],
            isRealAccount: true,
            verifications: profile.verifications || {
              phoneVerified: false,
              emailVerified: true,
              photoVerified: false,
              locationVerified: false,
              premiumUser: false
            }
          } as Profile,
          postImage: post.content_url,
          caption: post.caption,
          isAdminCard: ['admin', 'superadmin'].includes(profile.role),
          createdAt: post.created_at
        };
      }).filter(Boolean) || [];

      console.log('Transformed feed items:', transformedFeedItems);
      setFeedItems(transformedFeedItems);
    } catch (error) {
      console.error('Error in fetchFeed:', error);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Set up real-time subscription for new posts
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
          console.log('New post received:', payload);
          fetchFeed(); // Refresh the feed when new posts are added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  return (
    <div className="max-w-md mx-auto">
      <FeedContent
        feedItems={feedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={(itemId, profileId) => {
          console.log('Like:', itemId, profileId);
        }}
        onContact={(profile) => {
          console.log('Contact:', profile);
        }}
        onRefresh={fetchFeed}
      />
    </div>
  );
};

export default Feed;
