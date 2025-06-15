import React from 'react';
import ProfileCard from './ProfileCard';
import PostCard from './PostCard';
import ProviderProfileCard from './ProviderProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import ContentProfileCard from './ContentProfileCard';
import { useContentFeed } from '@/hooks/useContentFeed';
import { useUserRole } from '@/hooks/useUserRole';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import AdminTileCarousel from './AdminTileCarousel';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider' | 'admin' | 'superadmin';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  joinDate?: string;
  role?: string;
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

const PLACEHOLDER_IMAGE = "/placeholder.svg";

// Helper functions
const isValidMedia = (url?: string) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'].includes(ext ?? '');
};

const isProfileImageChanged = (imageUrl: string): boolean =>
  !!imageUrl && imageUrl !== PLACEHOLDER_IMAGE;

const isNewJoiner = (joinDate?: string) => {
  if (!joinDate) return false;
  const diff = differenceInMinutes(new Date(), new Date(joinDate));
  return diff <= 60;
};

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

  // Split profiles by admin/superadmin and normal users
  const adminRoles = ["admin", "superadmin"];

  // Convert all feedItems to an enriched format
  // We'll also ensure we have joinDate/role on all profiles if possible
  const enrichedFeedItems = feedItems.map(item => ({
    ...item,
    profile: {
      ...item.profile,
      role: item.profile.role || item.profile.userType,
      joinDate: item.profile.joinDate
    }
  }));

  // 1. Admin/Superadmin feed items: show ALL posts (with valid media) from admin/superadmin users
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

  // 2. Normal user feed items: only if they have media or profile image changed, unless new joiner in first hour
  const normalFeed = enrichedFeedItems.filter(item => {
    if (adminRoles.includes(String(item.profile.role).toLowerCase())) return false; // Already handled

    const hasMedia = (item.profile.posts && item.profile.posts.some(isValidMedia)) || (item.type === 'post' && isValidMedia(item.postImage));
    const imgChanged = isProfileImageChanged(item.profile.image);

    if (hasMedia || imgChanged) return true;

    // If they're a new joiner (joined within 1 hour), show "welcome" card
    if (isNewJoiner(item.profile.joinDate)) {
      return true;
    }

    return false; // Not eligible
  }).map(item => ({
    ...item,
    isAdminCard: false,
    isWelcome: isNewJoiner(item.profile.joinDate) && (!item.profile.posts || item.profile.posts.length === 0) && !isProfileImageChanged(item.profile.image)
  }));

  // 3. Compose output in loop rhythm: 2 admin, 1 user (default ratio ~66% admin, ~33% user)
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
  // If out of user posts, fill with admin (as per looped design)
  while (ai < adminFeed.length) {
    combinedFeed.push(adminFeed[ai++]);
  }

  // If out of admin and still user content, optionally fill with user cards (less likely per UX)
  while (ui < normalFeed.length) {
    combinedFeed.push(normalFeed[ui++]);
  }

  return (
    <div className="space-y-4 px-4 pb-6" role="list" aria-label="Social feed items">
      {/* ADMIN TILE CAROUSEL */}
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

      {/* Normal User Feed follows after admin carousel */}
      {combinedFeed.filter(item => !item.isAdminCard).map((item: any) => {
        if (item.isWelcome) {
          return (
            <div key={`welcome-${item.profile.id}`} className="bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-900 rounded-lg px-6 py-8 shadow-lg text-center">
              <h2 className="font-bold text-2xl text-white mb-2">👋 Welcome, {item.profile.name || 'New user'}!</h2>
              <p className="text-purple-200">Upload your first photo or video to be featured in the feed.</p>
              <p className="text-sm text-gray-400 mt-3">We can't wait to see your first post.</p>
            </div>
          );
        }

        if (item.type === 'post' && isValidMedia(item.postImage)) {
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
        }
        if (item.type === 'profile') {
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
        return null;
      })}

      {/* Empty State */}
      {combinedFeed.filter(item => !item.isAdminCard).length === 0 && (
        <div className="text-center py-8" aria-live="polite">
          <p className="text-gray-400">No profiles found.</p>
        </div>
      )}
    </div>
  );
};

export default FeedContent;
