
import React from 'react';
import PostCard from './PostCard';
import ProfileCard from './ProfileCard';
import ContentProfileCard from './ContentProfileCard';
import { FeedItem, Profile } from './types/feedTypes';

interface AdminTileCarouselProps {
  adminFeed: any[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onContentLike: (contentId: string, profileId: string) => void;
  onContentShare: (contentId: string) => void;
  tilesToShow: number;
  rotationIntervalMs: number;
}

const AdminTileCarousel: React.FC<AdminTileCarouselProps> = ({
  adminFeed,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
}) => {
  if (adminFeed.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {adminFeed.map((item, index) => {
        const key = `${item.id || item.profile?.id || 'unknown'}-${index}`;
        
        return (
          <div key={key} className="w-full">
            {item.isContent ? (
              <ContentProfileCard
                item={item}
                likedItems={likedItems}
                onLike={(contentId: string) => onContentLike(contentId, item.profile?.id || '')}
                onShare={onContentShare}
                isAdminCard={true}
              />
            ) : item.type === 'post' ? (
              <PostCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            ) : item.type === 'profile' ? (
              <ProfileCard
                item={{
                  ...item,
                  profile: {
                    ...item.profile,
                    userType: ['admin', 'superadmin'].includes(item.profile.userType) 
                      ? 'service_provider' as const 
                      : item.profile.userType as "user" | "service_provider"
                  }
                }}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default AdminTileCarousel;
