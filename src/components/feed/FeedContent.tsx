import React, { useState, useEffect } from 'react';
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

  // Combine regular feed items with content profile cards
  const combinedFeedItems = [
    ...contentFeedItems.map(item => ({ ...item, isContent: true })),
    ...feedItems.map(item => ({ ...item, isContent: false }))
  ].sort((a, b) => {
    // Handle timestamp for content items vs regular items
    const dateA = new Date(a.isContent && 'timestamp' in a ? a.timestamp : Date.now());
    const dateB = new Date(b.isContent && 'timestamp' in b ? b.timestamp : Date.now());
    return dateB.getTime() - dateA.getTime();
  });

  // Unified feed (no gender filter)
  const filteredItems = combinedFeedItems;

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Combined Feed Items */}
      {filteredItems.map((item: any) => {
        if (item.isContent) {
          // Render content profile card
          return (
            <ContentProfileCard
              key={`content-${item.id}`}
              item={item}
              likedItems={likedItems}
              onLike={handleContentLike}
              onShare={handleContentShare}
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
        <div className="text-center py-8">
          <p className="text-gray-400">No profiles found.</p>
        </div>
      )}

      {/* No More Content Message */}
      {filteredItems.length > 0 && feedItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No more content to display.</p>
        </div>
      )}
    </div>
  );
};

export default FeedContent;
