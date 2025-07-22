import * as lucideReact from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Post {
  profiles: any;
  id: string;
  content_url: string;
  post_type: string;
  created_at: Date | null;
  promotion_type: string;
}

function ProviderPostsTab({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardContent className="p-8 text-center">
          <lucideReact.Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No posts yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => {
        if (!post.created_at) {
          return (
            <Card key={post.id} className="bg-black/20 backdrop-blur-md border-gray-700">
              <CardContent className="p-0">
                <div className="w-full h-64 bg-gray-700 rounded-t flex items-center justify-center">
                  <p className="text-gray-400">Loading...</p>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card key={post.id} className="bg-black/20 backdrop-blur-md border-gray-700">
              <CardContent className="p-0">
                {post.post_type === 'image' ? (
                  <img
                    src={post.content_url || 'default-image-url'}
                    alt="Post content"
                    className="w-full h-64 object-cover rounded-t"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-700 rounded-t flex items-center justify-center">
                    {post.content_url && <lucideReact.Video className="w-12 h-12 text-gray-400" />}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
}

export default ProviderPostsTab;