
import React from "react";
import ProfileCard from "./ProfileCard";
import { FeedItem, Profile } from "./types/feedTypes";

interface FeedProfileCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const FeedProfileCard = (props: FeedProfileCardProps) => {
  return <ProfileCard {...props} />;
};

export default FeedProfileCard;
