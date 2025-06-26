import React, { useMemo } from "react";
import { isValidMedia } from "@/utils/feed/mediaUtils";
import WelcomeCard from "./WelcomeCard";
import FeedProfileCard from "./FeedProfileCard";
import FeedPostCard from "./FeedPostCard";
import { FeedItem, Profile } from "./types/feedTypes";

interface NormalFeedListProps {
  userFeed: (FeedItem & { isAdminCard?: boolean; isWelcome?: boolean })[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

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
  // Shuffle feed only when userFeed changes for performance
  const shuffledFeed = useMemo(() => shuffleArray(userFeed), [userFeed]);

  if (shuffledFeed.length === 0) {
    return (
      <div className="text-center py-8" aria-live="polite">
        <p className="text-gray-400">No profiles found.</p>
      </div>
    );
  }

  return (
    <>
      {shuffledFeed.map((item: any) => {
        if (item.isWelcome) {
          return (
            <WelcomeCard
              key={`welcome-${item.profile.id}`}
              profile={item.profile}
            />
          );
        }
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
        if (item.type === "profile") {
          return (
            <FeedProfileCard
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
    </>
  );
};

export default NormalFeedList;
