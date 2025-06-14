
import { BadgeCheck, Lock } from "lucide-react";
import OnlineStatus from "@/components/OnlineStatus";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface Profile {
  id: string;
  name: string;
  location: string;
  image: string;
  isRealAccount?: boolean;
}

interface PostCardHeaderProps {
  profile: Profile;
  isSubscribed: boolean;
  isUserOnline: (id: string) => boolean;
  onProfileClick: () => void;
  onAvatarClick: (e: React.MouseEvent) => void;
}

const PostCardHeader = ({
  profile,
  isSubscribed,
  isUserOnline,
  onProfileClick,
  onAvatarClick,
}: PostCardHeaderProps) => (
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="relative cursor-pointer" onClick={onAvatarClick}>
        <OptimizedImage
          src={profile.image}
          alt={profile.name}
          className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity"
          onClick={onAvatarClick}
          expandable
        />
        <OnlineStatus
          isOnline={isUserOnline(profile.id.toString())}
          size="sm"
          className="absolute -bottom-1 -right-1"
        />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h4
            className="font-semibold text-white text-sm cursor-pointer hover:text-purple-400 transition-colors"
            onClick={onProfileClick}
          >
            {profile.name}
          </h4>
          {profile.isRealAccount && (
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <BadgeCheck className="w-3 h-3 mr-1" />
              Real Account
            </div>
          )}
        </div>
        <p className="text-gray-400 text-xs">{profile.location}</p>
      </div>
    </div>
    {!isSubscribed && (
      <Lock className="w-4 h-4 text-yellow-500" />
    )}
  </div>
);

export default PostCardHeader;
