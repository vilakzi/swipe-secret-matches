import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/components/provider-profile/ProviderPostsTab';

export const usePostFetching = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Fetching posts with content validation...');

      const postsResponse = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_provider_id_fkey(
            id,
            display_name,
            profile_image_url,
            location,
            user_type,
            age,
            bio,
            whatsapp,
            gender,
            role,
            verifications
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .not('content_url', 'is', null)
        .not('content_url', 'eq', '')
        .order('created_at', { ascending: false });

      if (postsResponse.error) {
        console.error('Error fetching posts:', postsResponse.error);
        setError(postsResponse.error.message);
        setPosts([]);
        return;
      }

      console.log(`✅ Fetched ${postsResponse.data?.length || 0} posts`);

      const filteredValidPosts = (postsResponse.data ?? []).filter(
        (post: any) =>
          post.content_url &&
          typeof post.content_url === 'string' &&
          post.content_url.trim() !== ''
      );

      const mappedPosts = filteredValidPosts.map((postItem: any) => {
        const role = postItem.profiles?.role?.toLowerCase() || '';
        const isAdmin = ['admin', 'superadmin'].includes(role);

        return {
          ...postItem,
          isAdminPost: isAdmin,
          priorityWeight: isAdmin ? 10 : 1,
          boostFactor: isAdmin ? 3.0 : 1.0,
          content_url: postItem.content_url.startsWith('http')
            ? postItem.content_url
            : `${postItem.content_url}`
        };
      });

      console.log(`✅ Processed ${mappedPosts.length} valid posts with real content`);

      if (mappedPosts.length === 0) {
        console.log('⚠️ No valid posts found, checking database...');
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, content_url, payment_status, expires_at')
          .limit(5);
        console.log('Raw posts in database:', postsData);
      }

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    refetchPosts: fetchPosts
  };
};