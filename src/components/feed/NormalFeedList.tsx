
import React from "react";
import { isValidMedia } from "@/utils/feed/mediaUtils";
import { isProfileImageChanged } from "@/utils/feed/profileUtils";
import { isNewJoiner } from "@/utils/feed/joinerUtils";
import { PLACEHOLDER_IMAGE } from "@/utils/feed/profileUtils";
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
  onContentLike?: (contentId: string, profileId: string) => void;
  onContentShare?: (contentId: string) => void;
}

const NormalFeedList: React.FC<NormalFeedListProps> = ({
  userFeed = [], // Default to empty array to prevent undefined errors
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
}) => {
  // Safely filter the feed, ensuring userFeed is always an array
  const nonAdminFeed = Array.isArray(userFeed) 
    ? userFeed.filter(item => !item.isAdminCard)
    : [];

  if (nonAdminFeed.length === 0) {
    return (
      <div className="text-center py-8" aria-live="polite">
        <p className="text-gray-400">No profiles found.</p>
      </div>
    );
  }

  return (
    <>
      {nonAdminFeed.map((item: any) => {
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
