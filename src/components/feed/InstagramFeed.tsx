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
      // 1) Fetch posts (basic data only)
      let baseQuery = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + 9);

      if (search) {
        baseQuery = baseQuery.ilike('caption', `%${search}%`);
      }

      const { data: postsData, error: postsError } = await baseQuery;
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return [] as Post[];
      }

      const validPosts = (postsData || []).filter(
        (p: any) => typeof p.content_url === 'string' && p.content_url.trim() !== ''
      );

      if (validPosts.length === 0) return [] as Post[];

      // 2) Fetch related profiles by user_id
      const userIds = Array.from(new Set(validPosts.map((p: any) => p.user_id).filter(Boolean)));
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Profiles fetch warning:', profilesError);
      }
      const profilesByUserId = new Map(
        (profilesData || []).map((p: any) => [p.user_id, p])
      );

      // 3) Fetch likes for current user to know if liked
      let likesByPostId = new Map<string, boolean>();
      if (user && validPosts.length > 0) {
        const postIds = validPosts.map((p: any) => p.id);
        const { data: userLikes, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        if (likesError) {
          console.warn('Likes fetch warning:', likesError);
        }
        likesByPostId = new Map((userLikes || []).map((l: any) => [l.post_id, true]));
      }

      // 4) Compose final posts array with minimal profile + likes info
      const composed: Post[] = validPosts.map((p: any) => {
        const prof = profilesByUserId.get(p.user_id) || {};
        const isLiked = likesByPostId.get(p.id) || false;
        return {
          id: p.id,
          user_id: p.user_id,
          content_url: p.content_url,
          caption: p.caption,
          post_type: p.post_type,
          created_at: p.created_at,
          likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0,
          profiles: {
            id: p.user_id,
            username: prof.username || 'user',
            full_name: prof.full_name || 'User',
            avatar_url: prof.avatar_url || ''
          },
          likes: isLiked ? [{ user_id: user?.id as string }] : []
        } as Post;
      });

      return composed;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [] as Post[];
    }
  }, [user]);

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
            likes_count: Math.max(0, post.likes_count + (isLiked ? -1 : 1))
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