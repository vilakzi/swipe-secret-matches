import React from 'react';
import ProfileCard from './ProfileCard';
import PostCard from './PostCard';
import ProviderProfileCard from './ProviderProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import ContentProfileCard from './ContentProfileCard';
import { useContentFeed } from '@/hooks/useContentFeed';

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
  isRealAccount?: boolean;
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
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onRefresh: () => void;
}

const FeedContent = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh
}: FeedContentProps) => {
  const { contentFeedItems, handleContentLike, handleContentShare } = useContentFeed();
  const { user } = useAuth();

  // Filter user/service_provider content with meaningful media only:
  const filteredFeedItems = feedItems.filter(
    (item: any) =>
      item.type !== 'post' ||
      (item.type === 'post' && item.postImage && (item.postImage.endsWith('.jpg') || item.postImage.endsWith('.jpeg') || item.postImage.endsWith('.png') || item.postImage.endsWith('.webp') || item.postImage.endsWith('.gif') || item.postImage.endsWith('.mp4') || item.postImage.endsWith('.mov') || item.postImage.endsWith('.webm'))
  );

  // Sort: Always float/inject isContent (admin/superadmin) items to the top, then rhythmically mix or after N posts
  const adminFeed = contentFeedItems.map(item => ({ ...item, isContent: true }));
  const userFeed = filteredFeedItems.map(item => ({ ...item, isContent: false }));

  // For a rhythmic flow, interleave 1 admin after every 3 user posts (adjust as needed)
  const combinedFeedItems: any[] = [];
  let adminIdx = 0, userIdx = 0;
  const userChunk = 3;
  while (userIdx < userFeed.length || adminIdx < adminFeed.length) {
    for (let i = 0; i < userChunk && userIdx < userFeed.length; i++) {
      combinedFeedItems.push(userFeed[userIdx++]);
    }
    if (adminIdx < adminFeed.length) {
      combinedFeedItems.push(adminFeed[adminIdx++]);
    }
  }
  // If only admin content, show all admin items
  if (!userFeed.length) {
    adminFeed.forEach(item => {
      if (!combinedFeedItems.includes(item)) combinedFeedItems.push(item);
    });
  }

  const filteredItems = combinedFeedItems;

  return (
    <div className="space-y-4 px-4 pb-6" role="list" aria-label="Social feed items">
      {/* Combined Feed Items */}
      {filteredItems.map((item: any) => {
        if (item.isContent) {
          // Render content profile card with admin/superadmin marker
          return (
            <ContentProfileCard
              key={`content-${item.id}`}
              item={item}
              likedItems={likedItems}
              onLike={handleContentLike}
              onShare={handleContentShare}
              isAdminCard
            />
          );
        } else {
          // Render regular profile cards
          const isServiceProvider = item.profile.userType === 'service_provider';

          if (isServiceProvider) {
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
          } else if (item.type === 'post') {
            return (
              <PostCard
                key={item.id}
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            );
          } else {
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
          }
        }
      })}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8" aria-live="polite">
          <p className="text-gray-400">No profiles found.</p>
        </div>
      )}

      {/* No More Content Message */}
      {filteredItems.length > 0 && feedItems.length === 0 && (
        <div className="text-center py-8" aria-live="polite">
          <p className="text-gray-400">No more content to display.</p>
        </div>
      )}
    </div>
  );
};

export default FeedContent;
