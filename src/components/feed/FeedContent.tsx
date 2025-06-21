import React from 'react';
import AdminTileCarousel from './AdminTileCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { useContentFeed } from '@/hooks/useContentFeed';
import { useUserRole } from '@/hooks/useUserRole';
// Utility imports
import { isValidMedia } from '@/utils/feed/mediaUtils';
import { isProfileImageChanged } from '@/utils/feed/profileUtils';
import { isNewJoiner } from '@/utils/feed/joinerUtils';
import { FeedItem, Profile } from './types/feedTypes';
import NormalFeedList from './NormalFeedList';

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
  const { role } = useUserRole();

  const adminRoles = ["admin", "superadmin"];

  // Create wrapper functions to match expected signatures
  const handleContentLikeWrapper = async (contentId: string, profileId: string) => {
    handleContentLike(contentId, profileId);
  };

  const handleContentShareWrapper = async (contentId: string) => {
    handleContentShare(contentId);
  };

  // Enrich feed items with role/joinDate for easier checks
  const enrichedFeedItems = feedItems.map(item => ({
    ...item,
    isAdminCard: false,
    profile: {
      ...item.profile,
      role: item.profile.role || item.profile.userType,
      joinDate: item.profile.joinDate
    }
  }));

  // Convert content feed items to FeedItem type compatible format
  const contentAsRegularFeed = contentFeedItems.filter(
    c => !!c && !!c.id && isValidMedia(c.postImage)
  ).map(item => ({
    ...item,
    isContent: true,
    isAdminCard: true,
    // Ensure the profile matches FeedItem's Profile type
    profile: {
      ...item.profile,
      userType: item.profile.userType as "user" | "service_provider" | "admin" | "superadmin"
    }
  } as FeedItem & { isContent: true; isAdminCard: true }));

  // Admin carousel: posts from admin/superadmin, and published content feed
  const adminFeed = [
    ...contentAsRegularFeed,
    ...enrichedFeedItems.filter(item =>
      adminRoles.includes(String(item.profile.role).toLowerCase()) &&
      ((item.type === 'post' && isValidMedia(item.postImage)) ||
        (item.type === 'profile' && isProfileImageChanged(item.profile.image)))
    ).map(item => ({
      ...item,
      isAdminCard: true
    }))
  ];

  // All feed items combined for normal display
  const allFeedItems = [
    ...contentAsRegularFeed,
    ...enrichedFeedItems.filter(item => {
      const hasMedia = (item.profile.posts && item.profile.posts.some(isValidMedia)) || 
                      (item.type === 'post' && isValidMedia(item.postImage));
      const imgChanged = isProfileImageChanged(item.profile.image);
      const newJoiner = isNewJoiner(item.profile.joinDate);
      
      return hasMedia || imgChanged || newJoiner;
    }).map(item => ({
      ...item,
      isWelcome: isNewJoiner(item.profile.joinDate) && 
                 (!item.profile.posts || item.profile.posts.length === 0) && 
                 !isProfileImageChanged(item.profile.image)
    }))
  ];

  return (
    <div className="space-y-6 px-4 pb-6" role="list" aria-label="Social feed items">
      {adminFeed.length > 0 && (
        <AdminTileCarousel
          adminFeed={adminFeed}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
          onContentLike={handleContentLikeWrapper}
          onContentShare={handleContentShareWrapper}
          tilesToShow={2}
          rotationIntervalMs={5000}
        />
      )}
      
      <NormalFeedList
        userFeed={allFeedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
        onContentLike={handleContentLikeWrapper}
        onContentShare={handleContentShareWrapper}
      />
    </div>
  );
};

export default FeedContent;
