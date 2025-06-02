import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Lock } from 'lucide-react';
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
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface PostCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const PostCard = ({ item, likedItems, isSubscribed, onLike, onContact }: PostCardProps) => {
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
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer" onClick={handleProfileClick}>
            <OptimizedImage
              src={item.profile.image}
              alt={item.profile.name}
              className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity"
            />
            <OnlineStatus 
              isOnline={isUserOnline(item.profile.id.toString())} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div>
            <h4 
              className="font-semibold text-white text-sm cursor-pointer hover:text-purple-400 transition-colors"
              onClick={handleProfileClick}
            >
              {item.profile.name}
            </h4>
            <p className="text-gray-400 text-xs">{item.profile.location}</p>
          </div>
        </div>
        {!isSubscribed && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Post Image */}
      <div className="relative cursor-pointer" onClick={handleProfileClick}>
        <OptimizedImage
          src={item.postImage || ''}
          alt="Post"
          className="w-full h-72 hover:opacity-95 transition-opacity"
        />
        {/* Click overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
      </div>

      {/* Post Actions */}
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

        {/* Caption */}
        <div className="text-white">
          <span 
            className="font-semibold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={handleProfileClick}
          >
            {item.profile.name}
          </span>
          <span className="ml-2 text-gray-300">{item.caption}</span>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
