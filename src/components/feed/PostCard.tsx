import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share, Lock, BadgeCheck, Play } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';
import PostComments from './PostComments';
import { useState } from 'react';

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
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  const handlePostImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item.postImage || '', `${item.profile.name}'s post`);
  };

  const isVideo =
    item.postImage?.includes('.mp4') ||
    item.postImage?.includes('.mov') ||
    item.postImage?.includes('.webm');

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4">
        {/* Post Header */}
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
              <div className="flex items-center space-x-2">
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
              </div>
              <p className="text-gray-400 text-xs">{item.profile.location}</p>
            </div>
          </div>
          {!isSubscribed && (
            <Lock className="w-4 h-4 text-yellow-500" />
          )}
        </div>

        {/* Post Content */}
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              {console.log("[Feed] Video src:", item.postImage)}
              <video
                src={item.postImage}
                className="w-full h-72 object-cover"
                controls
                poster={item.postImage?.replace(/\.(mp4|mov|webm)$/, '.jpg')}
                onError={(e) => {
                  setVideoError('Failed to load video (check file integrity and URL).');
                  console.error('[Feed] Video failed to load:', item.postImage, e);
                }}
                onCanPlay={() => {
                  setVideoError(null);
                  console.log('[Feed] Video can be played:', item.postImage);
                }}
              >
                Sorry, your browser can't play this video.
              </video>
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <span className="text-red-400 font-bold text-center px-4">
                    {videoError}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Play className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          ) : (
            <OptimizedImage
              src={item.postImage || ''}
              alt="Post"
              className="w-full h-72 hover:opacity-95 transition-opacity"
              onClick={handlePostImageClick}
              expandable
            />
          )}
          <div 
            className="absolute top-4 left-4 right-4 h-8 bg-transparent cursor-pointer" 
            onClick={handleProfileClick}
          />
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
              <PostComments
                postId={item.id}
                isOpen={showComments}
                onToggle={() => setShowComments(!showComments)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-white p-0"
              >
                <Share className="w-6 h-6" />
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

          {/* Caption */}
          {item.caption && (
            <div className="text-white">
              <span 
                className="font-semibold cursor-pointer hover:text-purple-400 transition-colors"
                onClick={handleProfileClick}
              >
                {item.profile.name}
              </span>
              <span className="ml-2 text-gray-300">{item.caption}</span>
            </div>
          )}

          {/* Comments Section - Single instance */}
          {showComments && (
            <PostComments
              postId={item.id}
              isOpen={showComments}
              onToggle={() => setShowComments(!showComments)}
            />
          )}
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

export default PostCard;
