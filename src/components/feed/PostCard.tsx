
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import CommentsModal from './CommentsModal';

interface PostCardProps {
  post: {
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
  };
  currentUserId?: string;
  onLike: (postId: string, isLiked: boolean) => void;
}

const PostCard = ({ post, currentUserId, onLike }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isLiked = post.likes.some(like => like.user_id === currentUserId);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleLike = () => {
    onLike(post.id, isLiked);
  };

  return (
    <>
      <article className="bg-background border-b border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.profiles.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-foreground">
                {post.profiles.username || post.profiles.full_name}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Media Content */}
        <div className="relative aspect-square bg-muted">
          {post.post_type === 'image' ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-muted-foreground/20 w-8 h-8 rounded" />
                </div>
              )}
              <img
                src={post.content_url}
                alt={post.caption}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <video
              src={post.content_url}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'text-foreground'}`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(true)}
                className="p-0 h-auto text-foreground"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground">
                <Share className="w-6 h-6" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground">
              <Bookmark className="w-6 h-6" />
            </Button>
          </div>

          {/* Likes Count */}
          {post.likes_count > 0 && (
            <p className="font-semibold text-sm text-foreground mb-2">
              {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
            </p>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="text-sm text-foreground mb-2">
              <span className="font-semibold mr-2">{post.profiles.username}</span>
              <span>{post.caption}</span>
            </div>
          )}

          {/* Comments */}
          {post.comments_count > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {post.comments_count} comments
            </button>
          )}
        </div>
      </article>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        postUser={post.profiles}
      />
    </>
  );
};

export default PostCard;
