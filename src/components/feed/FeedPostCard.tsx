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
  // Ensure userType is defined before passing to PostCard
  const safeOnContact = (profile: Profile) => {
    if (
      profile.userType === "user" ||
      profile.userType === "service_provider" ||
      profile.userType === "admin" ||
      profile.userType === "superadmin"
    ) {
      props.onContact(profile as Profile & { userType: "user" | "service_provider" | "admin" | "superadmin" });
    } else {
      // Optionally handle the error case here
      console.warn("Invalid userType in profile:", profile);
    }
  };

  // Only pass onContact if item.profile.userType is valid
  const validUserTypes = ["user", "service_provider", "admin", "superadmin"] as const;
  const isValidUserType = validUserTypes.includes(props.item.profile.userType as any);

  return (
    <PostCard
      {...props}
      onContact={
        isValidUserType
          ? (profile) => {
              if (
                profile.userType === "user" ||
                profile.userType === "service_provider" ||
                profile.userType === "admin" ||
                profile.userType === "superadmin"
              ) {
                // Now TypeScript knows userType is not undefined
                safeOnContact(profile as Profile & { userType: "user" | "service_provider" | "admin" | "superadmin" });
              } else {
                console.warn("Invalid userType in profile:", profile);
              }
            }
          : () => {}
      }
    />
  );
};

export default FeedPostCard;
