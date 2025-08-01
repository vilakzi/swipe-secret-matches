
import React, { useState, useEffect } from 'react';
import FeedContent from '@/components/feed/FeedContent';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types/feedTypes';
import { checkDemoContentExists, createDemoContent } from '@/utils/demoContentSeeder';

const Feed = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check and create demo content if needed
  const initializeFeed = async () => {
    const contentCheck = await checkDemoContentExists();
    
    if (!contentCheck.hasProfiles || !contentCheck.hasPosts) {
      console.log('📝 No demo content found, creating sample data...');
      await createDemoContent();
    }
  };

  // Fetch posts from the posts table and transform them into feed items
  const fetchFeed = async () => {
    try {
      console.log('📱 Fetching posts from database...');
      // Get posts with profile information using correct join
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            user_id,
            username,
            full_name,
            bio,
            avatar_url
          ),
          likes!left (user_id)
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
            name: profile.full_name || profile.username || 'Unknown User',
            age: 25,
            image: profile.avatar_url || '/placeholder.svg',
            bio: profile.bio || '',
            whatsapp: '',
            location: '',
            userType: 'user',
            role: null,
            joinDate: new Date().toISOString(),
            posts: [post.content_url],
            isRealAccount: true,
            verifications: {
              phoneVerified: false,
              emailVerified: true,
              photoVerified: false,
              locationVerified: false,
              premiumUser: false
            }
          } as Profile,
          postImage: post.content_url,
          caption: post.caption,
          isAdminCard: false,
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
    // Initialize demo content and then fetch feed
    initializeFeed().then(fetchFeed);

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
