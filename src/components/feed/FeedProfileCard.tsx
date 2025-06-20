
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
  // Filter out admin/superadmin roles for ProfileCard compatibility
  const filteredItem = {
    ...props.item,
    profile: {
      ...props.item.profile,
      userType: ['admin', 'superadmin'].includes(props.item.profile.userType) 
        ? 'service_provider' as const 
        : props.item.profile.userType as "user" | "service_provider"
    }
  };

  return <ProfileCard {...props} item={filteredItem} />;
};

export default FeedProfileCard;
