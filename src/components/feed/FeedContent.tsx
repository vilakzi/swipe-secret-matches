import { Button } from '@/components/ui/button';
import ProfileCard from './ProfileCard';
import PostCard from './PostCard';
import ProviderProfileCard from './ProviderProfileCard';
import ContentPromoterCard from './ContentPromoterCard';
import { FeedItem } from '@/hooks/useFeedData';
import { useContentPromoter } from '@/hooks/useContentPromoter';

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
  const { contentItems, isActive, startContentPromoter, stopContentPromoter, availableFiles } = useContentPromoter();

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

  // Merge content promoter items with feed items
  const allItems = [...contentItems.map(item => ({ ...item, isContentPromoter: true })), ...feedItems];

  return (
    <div className="pb-20">
      {/* Content Promoter Controls - Only for admins */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-medium">Content Promoter</span>
            <p className="text-gray-400 text-xs">
              {availableFiles} MEGA files available
            </p>
          </div>
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={isActive ? stopContentPromoter : startContentPromoter}
          >
            {isActive ? 'Stop' : 'Start'} Auto Posts
          </Button>
        </div>
        {isActive && (
          <p className="text-gray-400 text-xs mt-1">
            Posting new content every 40 seconds from MEGA
          </p>
        )}
      </div>

      {allItems.length > 0 ? (
        <div className="space-y-4">
          {allItems.map(item => {
            if ('isContentPromoter' in item && item.isContentPromoter) {
              return (
                <ContentPromoterCard
                  key={item.id}
                  id={item.id}
                  contentUrl={item.url}
                  contentType={item.type}
                  colorName={item.colorName}
                  onLike={(itemId) => onLike(itemId, 'content-promoter')}
                  likedItems={likedItems}
                />
              );
            }
            
            const feedItem = item as FeedItem;
            return feedItem.type === 'profile' ? (
              renderProfileCard(feedItem)
            ) : (
              <PostCard
                key={feedItem.id}
                item={feedItem}
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
