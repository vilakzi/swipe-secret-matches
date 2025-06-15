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

  // Enhanced filter: exclude post items missing a valid postImage, and exclude any item with missing profile/id
  const isValidMedia = (url?: string) => {
    if (!url) return false;
    const ext = url.split('.').pop()?.toLowerCase();
    return [
      'jpg','jpeg','png','webp','gif','mp4','mov','webm'
    ].includes(ext ?? '');
  };

  const filteredFeedItems = feedItems.filter((item: any) => {
    if (!item || !item.profile || !item.id) return false;
    if (item.type === 'post') {
      return isValidMedia(item.postImage);
    }
    return true;
  });

  // Prepare adminFeed (contentFeedItems always have .file_url and .title per generator, but double check)
  const adminFeed = contentFeedItems
    .filter(
      (item) =>
        !!item && !!item.id && !!item.postImage && !!item.caption && isValidMedia(item.postImage)
    )
    .map(item => ({ ...item, isContent: true }));

  const userFeed = filteredFeedItems.map(item => ({ ...item, isContent: false }));

  // Interleave as before
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
  if (!userFeed.length) {
    adminFeed.forEach(item => {
      if (!combinedFeedItems.includes(item)) combinedFeedItems.push(item);
    });
  }

  const filteredItems = combinedFeedItems;

  return (
    <div className="space-y-4 px-4 pb-6" role="list" aria-label="Social feed items">
      {/* Combined Feed Items */}
      {filteredItems
        .filter((item: any) => !!item && !!item.profile && !!item.id) // extra safety
        .map((item: any) => {
          if (item.isContent) {
            // ContentProfileCard: ensure required fields present
            if (!item.postImage || !item.caption) return null;
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
            if (!item.profile || !item.id) return null;
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
            } else if (item.type === 'post' && item.postImage && isValidMedia(item.postImage)) {
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
            } else if (item.type === 'profile') {
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
            // Otherwise, do not render the card
            return null;
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
