
import React, { useEffect, useRef, useState } from "react";
import ContentProfileCard from "./ContentProfileCard";
import PostCard from "./PostCard";
import ProfileCard from "./ProfileCard";

// Respect explicit type if you have one!
type FeedItem = any; // Accepts adminFeed feed item with isAdminCard, isContent, etc.

interface AdminTileCarouselProps {
  adminFeed: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onContentLike: (itemId: string, profileId: string) => void;
  onContentShare: (itemId: string) => void;
  tilesToShow?: number; // How many tiles to display at once
  rotationIntervalMs?: number; // ms per rotation
}

// Utility to check for admin/superadmin
const isAdminOrSuperAdmin = (item: FeedItem) =>
  item?.profile?.role &&
  (item.profile.role.toLowerCase() === "admin" ||
    item.profile.role.toLowerCase() === "superadmin");

const AdminTileCarousel: React.FC<AdminTileCarouselProps> = ({
  adminFeed,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
  tilesToShow = 2,
  rotationIntervalMs = 5000,
}) => {
  // --- Filter ONLY admin/superadmin tiles from ALL time, and never deduplicate/remove
  // Each admin/superadmin post or real content will always be unique by id
  const adminTiles = adminFeed.filter(isAdminOrSuperAdmin);

  // Safety: sort by timestamp so latest admin posts come up first for extra dominance
  adminTiles.sort((a, b) => {
    // Try all possible timestamp properties
    const tA =
      a.timestamp ||
      a.created_at ||
      (a.profile && a.profile.created_at) ||
      new Date(0);
    const tB =
      b.timestamp ||
      b.created_at ||
      (b.profile && b.profile.created_at) ||
      new Date(0);

    return new Date(tB).getTime() - new Date(tA).getTime();
  });

  // Main persistent rotation queue ("permanent operator panel" for admin/superadmin)
  const [startIndex, setStartIndex] = useState(0);
  const feedLength = adminTiles.length;
  const intervalRef = useRef<number | null>(null);

  // Build visible rotating slice (never deduplicate; all admin/superadmin get their tile)
  const visibleTiles = [];
  for (let i = 0; i < Math.min(tilesToShow, feedLength); i++) {
    visibleTiles.push(adminTiles[(startIndex + i) % feedLength]);
  }

  // Rotation logic: infinite loop, never discard
  useEffect(() => {
    if (feedLength <= tilesToShow) return; // No need to rotate if not enough tiles
    intervalRef.current = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % feedLength);
    }, rotationIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [feedLength, tilesToShow, rotationIntervalMs]);

  if (!feedLength) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto transition-all duration-700 animate-fade-in py-2"
      style={{ borderRadius: 12 }}
      role="region"
      aria-label="Admin and superadmin posts"
    >
      {visibleTiles.map((item, idx) => {
        // Unique tile per post (per spec). Add red border for admin/superadmin dominance.
        const isAdminCard = isAdminOrSuperAdmin(item);

        if (item.isContent) {
          return (
            <div
              key={`admin-content-tile-${item.id}`}
              className={`w-full min-w-0 max-w-md border-2 ${isAdminCard ? "border-red-600 bg-red-950/60" : ""} rounded-lg shadow-md`}
            >
              <ContentProfileCard
                item={item}
                likedItems={likedItems}
                onLike={onContentLike}
                onShare={onContentShare}
                isAdminCard
              />
            </div>
          );
        }
        if (item.type === "post") {
          return (
            <div
              key={`admin-post-tile-${item.id}`}
              className={`w-full min-w-0 max-w-md border-2 ${isAdminCard ? "border-red-600 bg-red-950/60" : ""} rounded-lg shadow-md`}
            >
              <PostCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
                isAdminCard={isAdminCard}
              />
            </div>
          );
        }
        if (item.type === "profile") {
          return (
            <div
              key={`admin-profile-tile-${item.id}`}
              className={`w-full min-w-0 max-w-md border-2 ${isAdminCard ? "border-red-600 bg-red-950/60" : ""} rounded-lg shadow-md`}
            >
              <ProfileCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
                isAdminCard={isAdminCard}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default AdminTileCarousel;

