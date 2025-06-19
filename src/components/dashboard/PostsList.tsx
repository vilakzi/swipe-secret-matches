import React from 'react';
import { Card } from '@/components/ui/card';
import PostCard from './PostCard';

interface Post {
  id: string;
  content_url: string;
  post_type: string;
  expires_at: string;
  payment_status: string;
  promotion_type: string;
}

interface PostsListProps {
  posts: Post[];
}

const PostsList = ({ posts }: PostsListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Your Posts</h2>
      {posts.length === 0 ? (
        <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-8 text-center">
          <p className="text-gray-400">No posts yet. Create your first post!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsList;
