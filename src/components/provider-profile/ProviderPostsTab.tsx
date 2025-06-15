
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Images, Video } from 'lucide-react';

export interface Post {
  id: string;
  content_url: string;
  post_type: string;
  created_at: string;
  promotion_type: string;
}

const ProviderPostsTab = ({ posts }: { posts: Post[] }) => {
  if (!posts || posts.length === 0) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardContent className="p-8 text-center">
          <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No posts yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <Card key={post.id} className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardContent className="p-0">
            <div className="relative">
              {post.post_type === 'image' ? (
                <img src={post.content_url} alt="Post content" className="w-full h-64 object-cover rounded-t" />
              ) : (
                <div className="w-full h-64 bg-gray-700 rounded-t flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className={`
                  ${post.promotion_type === 'free_2h' ? 'bg-green-600' : 'bg-purple-600'}
                `}>
                  {post.promotion_type === 'free_2h' ? '2H Free' : 
                   post.promotion_type === 'paid_8h' ? '8H Promoted' : '12H Promoted'}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-400 text-sm">
                Posted {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProviderPostsTab;
