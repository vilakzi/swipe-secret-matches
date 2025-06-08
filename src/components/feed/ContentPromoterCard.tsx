
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share, Play, Clock } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';
import { useState } from 'react';

interface ContentPromoterCardProps {
  id: string;
  contentUrl: string;
  contentType: 'image' | 'video';
  colorName: string;
  fileName?: string;
  timestamp?: number;
  onLike: (itemId: string) => void;
  likedItems: Set<string>;
}

const ContentPromoterCard = ({ 
  id, 
  contentUrl, 
  contentType, 
  colorName, 
  fileName,
  timestamp,
  onLike, 
  likedItems 
}: ContentPromoterCardProps) => {
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(id);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contentType === 'image') {
      openModal(contentUrl, 'Content Promoter Post');
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isVideo = contentType === 'video';

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4 transition-all duration-300 hover:shadow-lg">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white text-sm">
                  Content Promoter
                </h4>
                <div 
                  className="px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                  style={{ backgroundColor: colorName }}
                >
                  {colorName}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-gray-400 text-xs">Automated Content</p>
                {timestamp && (
                  <>
                    <span className="text-gray-500">•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-xs">{formatTimeAgo(timestamp)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              <video
                src={contentUrl}
                className="w-full h-72 object-cover cursor-pointer max-h-96 rounded-sm"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Play className="w-12 h-12 text-white opacity-80 drop-shadow-lg" />
                </div>
              )}
            </div>
          ) : (
            <OptimizedImage
              src={contentUrl}
              alt="Content Promoter Post"
              className="w-full h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity max-h-96 rounded-sm"
              onClick={handleContentClick}
              expandable
            />
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 transition-colors ${likedItems.has(id) ? 'text-red-500' : 'text-white hover:text-red-400'}`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${likedItems.has(id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white p-0 hover:text-blue-400 transition-colors"
              >
                <Share className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="text-white">
            <span className="font-semibold">Content Promoter</span>
            <p className="text-gray-300 text-sm mt-1">
              {fileName ? `${fileName} - ` : ''}Premium content from our collection
            </p>
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

export default ContentPromoterCard;
