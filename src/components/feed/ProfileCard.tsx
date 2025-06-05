import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Lock, BadgeCheck } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';
import NewJoinerBadge from './NewJoinerBadge';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
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
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();

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

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item.profile.image, `${item.profile.name}'s profile photo`);
  };

  // Check if this is a new joiner (created in last 24 hours)
  const isNewJoiner = item.profile.isRealAccount && 
    new Date(Date.now() - 24 * 60 * 60 * 1000) < new Date();

  const displayImage = item.profile.posts && item.profile.posts.length > 0 
    ? item.profile.posts[0] 
    : item.profile.image;

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4">
        {/* Profile Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative cursor-pointer" onClick={handleAvatarClick}>
              <OptimizedImage
                src={item.profile.image}
                alt={item.profile.name}
                className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity"
                onClick={handleAvatarClick}
                expandable
              />
              <OnlineStatus 
                isOnline={isUserOnline(item.profile.id.toString())} 
                size="sm"
                className="absolute -bottom-1 -right-1"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h4 
                  className="font-semibold text-white text-sm cursor-pointer hover:text-purple-400 transition-colors"
                  onClick={handleProfileClick}
                >
                  {item.profile.name}
                </h4>
                {item.profile.isRealAccount && (
                  <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Real Account
                  </div>
                )}
                <NewJoinerBadge isNewJoiner={isNewJoiner} />
              </div>
              <p className="text-gray-400 text-xs">{item.profile.location}</p>
            </div>
          </div>
          {!isSubscribed && (
            <Lock className="w-4 h-4 text-yellow-500" />
          )}
        </div>

        {/* Main Content */}
        <div className="relative">
          {item.profile.posts && item.profile.posts.length > 0 ? (
            <OptimizedImage
              src={displayImage}
              alt={`${item.profile.name}'s post`}
              className="w-full h-72 hover:opacity-95 transition-opacity"
              onClick={handleProfileClick}
              expandable
            />
          ) : (
            <div className="w-full h-72 bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">No posts yet</p>
                <p className="text-gray-500 text-xs mt-1">Check back later for content</p>
              </div>
            </div>
          )}
          <div 
            className="absolute top-4 left-4 right-4 h-8 bg-transparent cursor-pointer" 
            onClick={handleProfileClick}
          />
        </div>

        {/* Profile Actions */}
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
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
              onClick={handleContact}
            >
              Contact
            </Button>
          </div>

          {/* Profile Info */}
          <div className="text-white">
            <span 
              className="font-semibold cursor-pointer hover:text-purple-400 transition-colors"
              onClick={handleProfileClick}
            >
              {item.profile.name}, {item.profile.age}
            </span>
            <p className="text-gray-300 text-sm mt-1">{item.profile.bio}</p>
            {item.profile.posts && item.profile.posts.length > 1 && (
              <p className="text-gray-400 text-xs mt-2">
                +{item.profile.posts.length - 1} more posts
              </p>
            )}
          </div>
        </div>
      </Card>

      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </>
  );
};

export default ProfileCard;
