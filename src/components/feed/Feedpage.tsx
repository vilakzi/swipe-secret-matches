
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
          // Add new posts to the existing feed without full refresh
          setFeedItems(prevItems => {
            const newPost = payload.new;
            if (!newPost || !newPost.provider_id) return prevItems;

            // Create new feed item
            const newFeedItem = {
              id: newPost.id,
              type: 'post' as const,
              profile: prevItems.find(item => item.profile.id === newPost.provider_id)?.profile || {
                id: newPost.provider_id,
                name: 'Loading...',
                age: 0,
                image: '/placeholder.svg',
                bio: '',
                whatsapp: '',
                location: '',
                userType: 'user',
                isRealAccount: true
              },
              postImage: newPost.content_url,
              caption: newPost.caption,
              createdAt: newPost.created_at
            };

            // Add to beginning of feed
            return [newFeedItem, ...prevItems];
          });
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
    fetchFeed(); // Refresh to get the latest data
  };

  return (
    <div>
      <PostUploadForm
        onUploadSuccess={() => {
          console.log('Upload success, refreshing feed');
          fetchFeed();
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
        onRefresh={fetchFeed}
      />
    </div>
  );
};

export default Feed;
