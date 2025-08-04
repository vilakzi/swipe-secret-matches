import * as React from 'react';
import { Play } from 'lucide-react';
import { isVideo } from '@/utils/feed/mediaUtils';

interface Post {
  id: string;
  content_url: string;
  caption?: string;
  post_type: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

interface PostsGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

const PostsGrid = ({ posts, onPostClick }: PostsGridProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="w-16 h-16 border-2 border-gray-600 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gray-600 rounded"></div>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
        <p className="text-sm text-center">When you share photos and videos, they'll appear on your profile.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="aspect-square relative cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onPostClick?.(post)}
        >
          <img
            src={post.content_url}
            alt={post.caption || 'Post'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Video indicator */}
          {isVideo(post.content_url) && (
            <div className="absolute top-2 right-2">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          {/* Hover overlay with stats */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center space-x-4 text-white">
              {post.likes_count !== undefined && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold">{post.likes_count}</span>
                </div>
              )}
              {post.comments_count !== undefined && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold">{post.comments_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsGrid;