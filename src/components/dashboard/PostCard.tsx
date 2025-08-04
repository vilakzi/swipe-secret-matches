import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Video } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    content_url: string;
    post_type: string;
    expires_at: string;
    payment_status: string;
    promotion_type: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {post.post_type === 'image' ? (
              <img 
                src={post.content_url} 
                alt="Post content" 
                className="w-full h-full object-cover object-center rounded"
                style={{ aspectRatio: '1/1', maxHeight: '4rem' }}
              />
            ) : post.post_type === 'video' ? (
              <video
                src={post.content_url}
                className="w-full h-full object-cover object-center rounded"
                style={{ aspectRatio: '1/1', maxHeight: '4rem' }}
                controls
                preload="metadata"
                aria-label="Video content"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-medium">
              {post.post_type === 'image'
                ? 'Image'
                : post.post_type === 'video'
                ? 'Video'
                : 'Post'} Post
            </p>
            <p className="text-sm text-gray-400">
              Expires: {new Date(post.expires_at).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Status: {post.payment_status}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            post.promotion_type === 'free_2h' 
              ? 'bg-green-500/20 text-green-400' 
              : post.promotion_type === 'paid_8h'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-purple-700/20 text-purple-300'
          }`}>
            {post.promotion_type === 'free_2h'
              ? '2H Free'
              : post.promotion_type === 'paid_8h'
              ? '8H Promoted'
              : post.promotion_type === 'paid_12h'
              ? '12H Promoted'
              : post.promotion_type}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;