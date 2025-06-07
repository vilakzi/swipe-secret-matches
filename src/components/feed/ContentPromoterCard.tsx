
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share, Play } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ImageModal from '@/components/ui/ImageModal';
import { useImageModal } from '@/hooks/useImageModal';
import { useState } from 'react';

interface ContentPromoterCardProps {
  id: string;
  contentUrl: string;
  contentType: 'image' | 'video';
  colorName: string;
  onLike: (itemId: string) => void;
  likedItems: Set<string>;
}

const ContentPromoterCard = ({ 
  id, 
  contentUrl, 
  contentType, 
  colorName, 
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

  const isVideo = contentType === 'video';

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
              <p className="text-gray-400 text-xs">Automated Content</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              <video
                src={contentUrl}
                className="w-full h-72 object-cover cursor-pointer"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              >
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Play className="w-12 h-12 text-white opacity-80" />
                </div>
              )}
            </div>
          ) : (
            <OptimizedImage
              src={contentUrl}
              alt="Content Promoter Post"
              className="w-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
              style={{ maxHeight: '400px' }}
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
                className={`p-0 ${likedItems.has(id) ? 'text-red-500' : 'text-white'}`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${likedItems.has(id) ? 'fill-current' : ''}`} />
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

          <div className="text-white">
            <span className="font-semibold">Content Promoter</span>
            <p className="text-gray-300 text-sm mt-1">Premium content from our collection</p>
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
