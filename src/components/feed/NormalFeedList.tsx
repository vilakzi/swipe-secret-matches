
import React from "react";
import ProfileCard from "./ProfileCard";
import PostCard from "./PostCard";
import { 
  isValidMedia, 
  isProfileImageChanged,
  isNewJoiner,
  PLACEHOLDER_IMAGE
} from "@/utils/feedUtils";

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: "male" | "female";
  userType?: "user" | "service_provider" | "admin" | "superadmin";
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  joinDate?: string;
  role?: string;
}

interface FeedItem {
  id: string;
  type: "profile" | "post";
  profile: Profile;
  postImage?: string;
  caption?: string;
  isWelcome?: boolean;
}

interface NormalFeedListProps {
  userFeed: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const NormalFeedList: React.FC<NormalFeedListProps> = ({
  userFeed,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
}) => {
  const nonAdminFeed = userFeed.filter(item => !item.isAdminCard);

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
            <div key={`welcome-${item.profile.id}`} className="bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-900 rounded-lg px-6 py-8 shadow-lg text-center">
              <h2 className="font-bold text-2xl text-white mb-2">👋 Welcome, {item.profile.name || 'New user'}!</h2>
              <p className="text-purple-200">Upload your first photo or video to be featured in the feed.</p>
              <p className="text-sm text-gray-400 mt-3">We can't wait to see your first post.</p>
            </div>
          );
        }
        if (item.type === "post" && isValidMedia(item.postImage)) {
          return (
            <PostCard
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
            <ProfileCard
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
