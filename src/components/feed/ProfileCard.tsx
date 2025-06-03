
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Share, Lock, BadgeCheck } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface ProfileCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const ProfileCard = ({ item, likedItems, isSubscribed, onLike, onContact }: ProfileCardProps) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    console.log('Navigating to profile:', item.profile.id);
    navigate(`/profile/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(item.profile);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      {/* Profile Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer" onClick={handleProfileClick}>
            <OptimizedImage
              src={item.profile.image}
              alt={item.profile.name}
              className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
            />
            <OnlineStatus 
              isOnline={isUserOnline(item.profile.id.toString())} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors"
                onClick={handleProfileClick}
              >
                {item.profile.name}, {item.profile.age}
              </h3>
              {item.profile.isRealAccount && (
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Real Account
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {item.profile.location}
              {item.profile.gender && (
                <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded-full">
                  {item.profile.gender}
                </span>
              )}
            </div>
          </div>
        </div>
        {!isSubscribed && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Profile Image */}
      <div className="relative cursor-pointer" onClick={handleProfileClick}>
        <OptimizedImage
          src={item.profile.image}
          alt={item.profile.name}
          className="w-full h-80 hover:opacity-95 transition-opacity"
        />
        {/* Click overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 ${likedItems.has(item.id) ? 'text-red-500' : 'text-white'}`}
              onClick={handleLike}
            >
              <Heart className={`w-6 h-6 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
              onClick={handleContact}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="text-white">
          <span 
            className="font-semibold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={handleProfileClick}
          >
            {item.profile.name}
          </span>
          <span className="ml-2 text-gray-300">{item.profile.bio}</span>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
