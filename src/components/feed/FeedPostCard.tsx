import React from "react";
import PostCard from "./PostCard";
import { FeedItem, Profile } from "./types/feedTypes";

interface FeedPostCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const FeedPostCard = (props: FeedPostCardProps) => {
  return <PostCard {...props} />;
};

export default FeedPostCard;
