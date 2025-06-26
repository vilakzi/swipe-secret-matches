
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
  // Narrow userType to only "user" | "service_provider"
  const { item, ...rest } = props;
  if (item.profile.userType !== "user" && item.profile.userType !== "service_provider") {
    return null;
  }
  return <ProfileCard {...rest} item={{ ...item, profile: { ...item.profile, userType: item.profile.userType as "user" | "service_provider" } }} />;
};

export default FeedProfileCard;
