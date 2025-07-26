import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { isValidMedia } from "@/utils/feed/mediaUtils";
import FeedPostCard from "./FeedPostCard";
import { FeedItem, Profile } from "./types/feedTypes";

interface NormalFeedListProps {
  userFeed: (FeedItem & { isAdminCard?: boolean; isWelcome?: boolean })[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const PAGE_SIZE = 15;

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const NormalFeedList: React.FC<NormalFeedListProps> = ({
  userFeed,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
}) => {
  // Memoize shuffled feed for performance
  const shuffledFeed = useMemo(() => shuffleArray(userFeed), [userFeed]);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: load more when loader is visible
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, shuffledFeed.length));
    }
  }, [shuffledFeed.length]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE); // Reset on feed change
  }, [shuffledFeed]);

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  if (shuffledFeed.length === 0) {
    return (
      <div className="text-center py-8" aria-live="polite">
        <p className="text-gray-400">No posts found.</p>
      </div>
    );
  }

  return (
    <>
      {shuffledFeed.slice(0, visibleCount).map((item: any) => {
        // Only show posts for Instagram-style feed
        if (item.type === "post" && isValidMedia(item.postImage)) {
          return (
            <FeedPostCard
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
      {/* Loader for infinite scroll */}
      {visibleCount < shuffledFeed.length && (
        <div ref={loaderRef} className="py-8 text-center text-gray-400">
          Loading more...
        </div>
      )}
    </>
  );
};

export default NormalFeedList;
