
import React, { useState, useEffect } from 'react';
import PostUploadForm from '@/components/dashboard/PostUploadForm';
import FeedContent from '@/components/feed/FeedContent';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types/feedTypes';

const Feed = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from the posts table and transform them into feed items
  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);
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
        setError('Failed to load posts. Please try again.');
        return;
      }

      if (!posts) {
        console.error('No posts data received');
        setError('Failed to load feed data');
        return;
      }

      if (posts.length === 0) {
        console.log('No posts found');
        setFeedItems([]);
        return;
      }

      console.log('Raw posts from database:', posts);

      // Transform posts into feed items
      const transformedFeedItems = posts.map(post => {
        const profile = post.profiles;
        if (!profile || !post.content_url) {
          console.warn('Invalid post or profile data:', { post, profile });
          return null;
        }

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
      setError('An unexpected error occurred. Please try again.');
      setFeedItems([]);
    } finally {
      setIsLoading(false);
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
        async (payload) => {
          console.log('New post received:', payload);
          try {
            const newPost = payload.new;
            if (!newPost || !newPost.provider_id) {
              console.warn('Invalid post data received:', newPost);
              return;
            }

            // Fetch the complete profile data for the new post
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newPost.provider_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile for new post:', profileError);
              return;
            }

            // Create new feed item with complete profile data
            const newFeedItem = {
              id: newPost.id,
              type: 'post' as const,
              profile: {
                id: profileData.id,
                name: profileData.display_name || 'Unknown User',
                age: profileData.age || 25,
                image: profileData.profile_image_url || '/placeholder.svg',
                bio: profileData.bio || '',
                whatsapp: profileData.whatsapp || '',
                location: profileData.location || '',
                userType: profileData.user_type || 'user',
                role: profileData.role,
                joinDate: profileData.created_at,
                isRealAccount: true,
                verifications: profileData.verifications || {
                  phoneVerified: false,
                  emailVerified: true,
                  photoVerified: false,
                  locationVerified: false,
                  premiumUser: false
                }
              },
              postImage: newPost.content_url,
              caption: newPost.caption,
              createdAt: newPost.created_at
            };

            // Update feed items
            setFeedItems(prevItems => [newFeedItem, ...prevItems]);
          } catch (error) {
            console.error('Error processing new post:', error);
          }
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
          setIsLoading(true);
          setError(null);
          fetchFeed().finally(() => setIsLoading(false));
        }}
        onShowPayment={(post) => {
          console.log('Show payment for post:', post);
        }}
        onAddPostToFeed={handleAddPostToFeed}
      />
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-400">Loading feed...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-red-400">{error}</div>
        </div>
      ) : (
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
            setIsLoading(true);
            setError(null);
            fetchFeed().finally(() => setIsLoading(false));
          }}
        />
      )}
    </div>
  );
};

export default Feed;
