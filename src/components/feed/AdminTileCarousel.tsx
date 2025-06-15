
import React, { useEffect, useRef, useState } from "react";
import ContentProfileCard from "./ContentProfileCard";
import PostCard from "./PostCard";
import ProfileCard from "./ProfileCard";

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
  const [startIndex, setStartIndex] = useState(0);
  const feedLength = adminFeed.length;
  const intervalRef = useRef<number | null>(null);

  // Compute the "current" set of admin tiles (rotating window)
  const visibleTiles = [];
  for (let i = 0; i < Math.min(tilesToShow, feedLength); i++) {
    visibleTiles.push(adminFeed[(startIndex + i) % feedLength]);
  }

  useEffect(() => {
    if (feedLength <= tilesToShow) return; // No need to rotate
    intervalRef.current = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % feedLength);
    }, rotationIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [feedLength, tilesToShow, rotationIntervalMs]);

  if (!feedLength) return null;

  return (
    <div className="flex gap-4 overflow-x-auto transition-all duration-700 animate-fade-in">
      {visibleTiles.map((item, idx) => {
        if (item.isContent) {
          return (
            <div key={`admin-content-tile-${item.id}`} className="w-full min-w-0 max-w-md">
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
            <div key={`admin-post-tile-${item.id}`} className="w-full min-w-0 max-w-md">
              <PostCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            </div>
          );
        }
        if (item.type === "profile") {
          return (
            <div key={`admin-profile-tile-${item.id}`} className="w-full min-w-0 max-w-md">
              <ProfileCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
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
