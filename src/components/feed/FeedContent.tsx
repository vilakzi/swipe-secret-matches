
import React from 'react';
import AdminTileCarousel from './AdminTileCarousel';
import NormalFeedList from './NormalFeedList';
import { useAuth } from '@/contexts/AuthContext';
import ContentProfileCard from './ContentProfileCard';
import { useContentFeed } from '@/hooks/useContentFeed';
import { useUserRole } from '@/hooks/useUserRole';
// Utility imports
import { isValidMedia } from '@/utils/feed/mediaUtils';
import { isProfileImageChanged } from '@/utils/feed/profileUtils';
import { isNewJoiner } from '@/utils/feed/joinerUtils';
import { FeedItem, Profile } from './types/feedTypes';

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

  // Admin carousel: posts from admin/superadmin, and published content feed
  const adminFeed = [
    ...(contentFeedItems.filter(
      c => !!c && !!c.id && isValidMedia(c.postImage)
    )
      .map(item => ({ ...item, isContent: true, isAdminCard: true }))),
    ...enrichedFeedItems.filter(item =>
      adminRoles.includes(String(item.profile.role).toLowerCase()) &&
      ((item.type === 'post' && isValidMedia(item.postImage)) ||
        (item.type === 'profile' && isProfileImageChanged(item.profile.image)))
    ).map(item => ({
      ...item,
      isAdminCard: true
    }))
  ];

  // Normal users: include valid posts, profile image updates, or new joiners (60 min)
  const normalFeed = enrichedFeedItems.filter(item => {
    if (adminRoles.includes(String(item.profile.role).toLowerCase())) return false;
    const hasMedia = (item.profile.posts && item.profile.posts.some(isValidMedia)) || (item.type === 'post' && isValidMedia(item.postImage));
    const imgChanged = isProfileImageChanged(item.profile.image);

    if (hasMedia || imgChanged) return true;
    if (isNewJoiner(item.profile.joinDate)) return true;
    return false;
  }).map(item => ({
    ...item,
    isAdminCard: false,
    isWelcome: isNewJoiner(item.profile.joinDate) && (!item.profile.posts || item.profile.posts.length === 0) && !isProfileImageChanged(item.profile.image)
  }));

  // Compose combined feed, preserve original chunk design (2 admin : 1 user)
  const combinedFeed: any[] = [];
  let ai = 0, ui = 0;
  const adminChunk = 2;
  const userChunk = 1;
  while (ai < adminFeed.length || ui < normalFeed.length) {
    for (let a = 0; a < adminChunk && ai < adminFeed.length; a++) {
      combinedFeed.push(adminFeed[ai++]);
    }
    for (let u = 0; u < userChunk && ui < normalFeed.length; u++) {
      combinedFeed.push(normalFeed[ui++]);
    }
  }
  while (ai < adminFeed.length) combinedFeed.push(adminFeed[ai++]);
  while (ui < normalFeed.length) combinedFeed.push(normalFeed[ui++]);

  return (
    <div className="space-y-4 px-4 pb-6" role="list" aria-label="Social feed items">
      {adminFeed.length > 0 && (
        <AdminTileCarousel
          adminFeed={adminFeed}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
          onContentLike={handleContentLike}
          onContentShare={handleContentShare}
          tilesToShow={2}
          rotationIntervalMs={5000}
        />
      )}
      <NormalFeedList
        userFeed={combinedFeed}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
      />
    </div>
  );
};

export default FeedContent;
