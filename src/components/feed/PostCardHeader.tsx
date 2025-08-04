
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";
import VerificationBadges from "@/components/VerificationBadges";

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: "male" | "female";
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  verifications?: {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    photoVerified?: boolean;
    locationVerified?: boolean;
    premiumUser?: boolean;
  };
}

interface PostCardHeaderProps {
  profile: Profile;
  isSubscribed: boolean;
  onProfileClick: () => void;
  onAvatarClick: (e: React.MouseEvent) => void;
  isVideoPost?: boolean;
  children?: React.ReactNode;
}

const PostCardHeader = ({
  profile,
  isSubscribed,
  onProfileClick,
  onAvatarClick,
  isVideoPost = false,
  children,
}: PostCardHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer" onClick={onAvatarClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile.image}
                alt={`${profile.name}'s avatar`}
                className="object-cover"
              />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3
                className="font-semibold text-white cursor-pointer hover:underline"
                onClick={onProfileClick}
              >
                {profile.name}
              </h3>
              {isVideoPost && (
                <Video 
                  className="w-4 h-4 text-gray-400" 
                  aria-label="Video post"
                />
              )}
              {profile.verifications && (
                <VerificationBadges verifications={profile.verifications} />
              )}
            </div>
            {profile.location && (
              <div className="text-sm text-gray-400">
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PostCardHeader;
