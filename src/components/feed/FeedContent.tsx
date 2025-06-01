
import { Button } from '@/components/ui/button';
import ProfileCard from './ProfileCard';
import PostCard from './PostCard';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  liked?: boolean;
  posts?: string[];
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface FeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  filterGender: 'male' | 'female' | null;
  onLike: (itemId: string, profileId: number) => void;
  onContact: (profile: Profile) => void;
  onRefresh: () => void;
  setFilterGender: (gender: 'male' | 'female' | null) => void;
}

const FeedContent = ({ 
  feedItems, 
  likedItems, 
  isSubscribed, 
  filterGender,
  onLike, 
  onContact, 
  onRefresh,
  setFilterGender
}: FeedContentProps) => {
  return (
    <div className="pb-20">
      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map(item => 
            item.type === 'profile' ? (
              <ProfileCard
                key={item.id}
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            ) : (
              <PostCard
                key={item.id}
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No profiles found for the selected filter.</p>
          <Button
            variant="ghost"
            className="text-purple-400 mt-2"
            onClick={() => setFilterGender(null)}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedContent;
