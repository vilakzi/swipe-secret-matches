import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import InstagramProfileHeader from './InstagramProfileHeader';
import PostsGrid from './PostsGrid';

interface InstagramProfile {
  id: string;
  display_name: string;
  bio?: string;
  profile_image_url?: string;
  user_type: 'user' | 'service_provider';
  created_at: string;
  verifications?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    photoVerified?: boolean;
    locationVerified?: boolean;
    premiumUser?: boolean;
  };
}

interface Post {
  id: string;
  content_url: string;
  caption?: string;
  post_type: string;
  created_at: string;
}

const InstagramProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
      if (!isOwnProfile) {
        checkFollowStatus();
      }
      fetchFollowCounts();
    }
  }, [userId, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const transformedProfile: InstagramProfile = {
        id: data.id,
        display_name: data.display_name || 'User',
        bio: data.bio || '',
        profile_image_url: data.profile_image_url || '',
        user_type: data.user_type || 'user',
        created_at: data.created_at,
        verifications: typeof data.verifications === 'object' && data.verifications !== null 
          ? data.verifications as any
          : {
              emailVerified: false,
              phoneVerified: false,
              photoVerified: false,
              locationVerified: false,
              premiumUser: false
            }
      };
      
      setProfile(transformedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || !userId) return;

    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // User is not following
      setIsFollowing(false);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      // Get followers count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profile?.display_name}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({
          title: "Following",
          description: `You are now following ${profile?.display_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    // Messaging functionality placeholder
    toast({
      title: "Coming Soon",
      description: "Messaging feature will be available soon!",
    });
  };

  const handleEditProfile = () => {
    // Profile editing functionality placeholder
    toast({
      title: "Coming Soon",
      description: "Profile editing will be available soon!",
    });
  };

  const handlePostClick = (post: Post) => {
    // Post detail functionality placeholder - opens post modal
    toast({
      title: "Post Details",
      description: "Post detail view will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto">
        <InstagramProfileHeader
          profile={{
            ...profile,
            postsCount: posts.length,
            followersCount,
            followingCount,
            isFollowing,
            isOwnProfile,
          }}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onEditProfile={handleEditProfile}
        />
        
        <PostsGrid 
          posts={posts}
          onPostClick={handlePostClick}
        />
      </div>
    </div>
  );
};

export default InstagramProfile;