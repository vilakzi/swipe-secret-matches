
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostFetching = () => {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Enhanced post processing with admin prioritization
      const processedPosts = (postsData || []).map(post => {
        const role = post.profiles?.role?.toLowerCase() || '';
        const isAdmin = ['admin'].includes(role);
        
        return {
          ...post,
          // Enhanced priority system
          isAdminPost: isAdmin,
          priorityWeight: isAdmin ? 10 : 1,
          // Add boost factor for algorithm
          boostFactor: isAdmin ? 3.0 : 1.0 // Reduced from 5.0 to 3.0
        };
      });

      console.log('Processed posts with admin priority:', processedPosts.length);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    fetchPosts,
    refetchPosts: fetchPosts
  };
};
