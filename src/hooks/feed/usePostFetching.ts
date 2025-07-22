
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostFetching = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Fetching posts with content validation...');
      
      const { data: postsData, error } = await supabase
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

      if (error) {
        console.error('Error fetching posts:', error);
        setError(error.message);
        return;
      }

      // Filter and validate posts with content
      const validPosts = (postsData || []).filter(post => {
        const hasValidContent = post.content_url && post.content_url.trim() !== '';
        const hasValidProfile = post.profiles && 
          post.profiles.id && 
          post.profiles.display_name && 
          post.profiles.display_name.trim() !== '';
        
        return hasValidContent && hasValidProfile;
      });

      // Enhanced post processing with admin prioritization
      const processedPosts = validPosts.map(post => {
        const role = post.profiles?.role?.toLowerCase() || '';
        const isAdmin = ['admin', 'superadmin'].includes(role);
        
        return {
          ...post,
          isAdminPost: isAdmin,
          priorityWeight: isAdmin ? 10 : 1,
          boostFactor: isAdmin ? 3.0 : 1.0
        };
      });

      console.log(`✅ Processed ${processedPosts.length} valid posts with content`);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
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
