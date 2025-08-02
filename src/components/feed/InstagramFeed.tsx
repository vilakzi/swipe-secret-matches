import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from './PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Plus, Search, Heart } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import { Input } from '@/components/ui/input';
import { StoriesBar } from '@/components/stories/StoriesBar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useRealTimeActivity } from '@/hooks/useRealTimeActivity';

interface Post {
  id: string;
  user_id: string;
  content_url: string;
  caption: string;
  post_type: 'image' | 'video';
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  likes: { user_id: string }[];
}

const InstagramFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Enable real-time activity tracking
  useRealTimeActivity();

  const fetchPosts = useCallback(async (offset = 0, search = '') => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_provider_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          ),
          likes!left (user_id)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + 9);

      if (search) {
        query = query.or(`caption.ilike.%${search}%,profiles.username.ilike.%${search}%,profiles.full_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }, []);

  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    const newPosts = await fetchPosts(0, searchQuery);
    setPosts(newPosts);
    setHasMore(newPosts.length === 10);
    setLoading(false);
  }, [fetchPosts, searchQuery]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore) return;
    
    const newPosts = await fetchPosts(posts.length, searchQuery);
    setPosts(prev => [...prev, ...newPosts]);
    setHasMore(newPosts.length === 10);
  }, [fetchPosts, posts.length, hasMore, searchQuery]);

  const handleLike = useCallback(async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedLikes = isLiked 
            ? post.likes.filter(like => like.user_id !== user.id)
            : [...post.likes, { user_id: user.id }];
          
          return {
            ...post,
            likes: updatedLikes,
            likes_count: updatedLikes.length
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // Real-time subscriptions for new posts
  useEffect(() => {
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          loadInitialPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInitialPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-5 h-5" />
            </Button>
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreatePost(true)}
              className="text-primary hover:bg-primary/10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search posts, users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stories Bar */}
      <StoriesBar />

      {/* Posts Feed */}
      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button onClick={() => setShowCreatePost(true)} className="bg-primary hover:bg-primary/90">
              Create your first post
            </Button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
              />
            ))}
            
            {hasMore && (
              <div className="p-4">
                <Button
                  onClick={loadMorePosts}
                  variant="outline"
                  className="w-full"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={loadInitialPosts}
      />
    </div>
  );
};

export default InstagramFeed;