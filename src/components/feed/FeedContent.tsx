
import { Button } from '@/components/ui/button';
import ProfileCard from './ProfileCard';
import PostCard from './PostCard';
import ProviderProfileCard from './ProviderProfileCard';
import { FeedItem } from '@/hooks/useFeedData';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
  liked?: boolean;
  posts?: string[];
}

interface FeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  filterGender: 'male' | 'female' | null;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
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
  const renderProfileCard = (item: FeedItem) => {
    // Use enhanced provider card for service providers
    if (item.profile.userType === 'service_provider') {
      return (
        <ProviderProfileCard
          key={item.id}
          item={item}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
        />
      );
    }

    // Use regular profile card for other cases
    return (
      <ProfileCard
        key={item.id}
        item={item}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
      />
    );
  };

  return (
    <div className="pb-20">
      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map(item => {
            return item.type === 'profile' ? (
              renderProfileCard(item)
            ) : (
              <PostCard
                key={item.id}
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            );
          })}
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
