import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Play, Image as ImageIcon, BadgeCheck, Clock, Shield } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';
import { ContentFeedItem } from '@/utils/contentProfileGenerator';
import { formatDistanceToNow } from 'date-fns';

interface ContentProfileCardProps {
  item: ContentFeedItem;
  likedItems: Set<string>;
  onLike: (itemId: string, profileId: string) => void;
  onShare: (itemId: string) => void;
  isAdminCard?: boolean;
}

const ContentProfileCard = ({
  item,
  likedItems,
  onLike,
  onShare,
  isAdminCard = false
}: ContentProfileCardProps) => {
  // Check if this is an admin or superadmin post (you may have role info in item.profile)
  // For this demo, always show the badge if isAdminCard is true
  // You can expand this by checking item.profile.role

  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(item.id, item.profile.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(item.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.contentType === 'image') {
      openModal(item.postImage || '', `${item.profile.name} content`);
    }
  };

  const isVideo = item.contentType === 'video';
  const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

  return (
    <div
      className={
        isAdminCard
          ? 'relative bg-red-900/80 border-2 border-red-600 ring-2 ring-red-600 rounded-xl p-4 shadow-lg my-2'
          : 'relative bg-gray-800 border border-gray-700 rounded-xl p-4 shadow'
      }
    >
      {isAdminCard && (
        <div className="absolute top-3 left-3 flex items-center gap-1 z-20">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-700 text-white shadow">
            <Shield className="w-4 h-4 mr-1" />
            ADMIN
          </span>
        </div>
      )}
      <Card className="bg-gray-800 border-gray-700 mb-4">
        {/* Content Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <OptimizedImage
                src={item.profile.image}
                alt="Content Logo"
                className="w-10 h-10 rounded-full"
                expandable={false}
              />
              {/* Official Content Badge */}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white text-sm">
                  {item.profile.name}
                </h4>
                {/* Verification Badge */}
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Official
                </div>
                {/* Content Type Badge */}
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                  {isVideo ? (
                    <Play className="w-3 h-3 mr-1" />
                  ) : (
                    <ImageIcon className="w-3 h-3 mr-1" />
                  )}
                  {item.contentType}
                </Badge>
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {timeAgo}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              <video
                src={item.postImage}
                className="w-full h-72 object-cover"
                controls
                poster={item.postImage?.replace(/\.(mp4|mov|webm)$/, '.jpg')}
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/60 text-white">
                  <Play className="w-3 h-3 mr-1" />
                  Video
                </Badge>
              </div>
            </div>
          ) : (
            <OptimizedImage
              src={item.postImage || ''}
              alt="Content"
              className="w-full h-72 hover:opacity-95 transition-opacity cursor-pointer"
              onClick={handleImageClick}
              expandable
            />
          )}
        </div>

        {/* Engagement Section */}
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
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white p-0"
                onClick={handleShare}
              >
                <Share className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
            <span>{item.engagement.likes.toLocaleString()} likes</span>
            <span>{item.engagement.views.toLocaleString()} views</span>
            {item.engagement.shares > 0 && (
              <span>{item.engagement.shares.toLocaleString()} shares</span>
            )}
          </div>

          {/* Caption */}
          {item.caption && (
            <div className="text-white">
              <span className="font-semibold">
                {item.profile.name}
              </span>
              <span className="ml-2 text-gray-300">{item.caption}</span>
            </div>
          )}
        </div>
      </Card>

      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </div>
  );
};

export default ContentProfileCard;
