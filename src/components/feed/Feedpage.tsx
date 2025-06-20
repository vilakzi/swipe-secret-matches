
import React, { useState, useEffect } from 'react';
import PostUploadForm from '@/components/dashboard/PostUploadForm';
import FeedContent from '@/components/feed/FeedContent';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types/feedTypes';

const Feed = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch posts from the posts table and transform them into feed items
  useEffect(() => {
    const fetchFeed = async () => {
      try {
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
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }

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
              isRealAccount: true
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

  // Add new post to feed instantly (for optimistic updates from PostUploadForm)
  const handleAddPostToFeed = (newPost: any) => {
    console.log('Adding post to feed:', newPost);
    // The real-time subscription will handle this, but we can also do an optimistic update
    fetchFeed();
  };

  const fetchFeed = async () => {
    // This function is defined in the useEffect above
    // We can extract it if needed, but for now this reference works
  };

  return (
    <div>
      <PostUploadForm
        onUploadSuccess={() => {
          console.log('Upload success, refreshing feed');
        }}
        onShowPayment={(post) => {
          console.log('Show payment for post:', post);
        }}
        onAddPostToFeed={handleAddPostToFeed}
      />
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
        onRefresh={() => {
          fetchFeed();
        }}
      />
    </div>
  );
};

export default Feed;
