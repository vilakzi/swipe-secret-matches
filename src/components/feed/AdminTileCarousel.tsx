
import React, { useState, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentPromoterCard from './ContentPromoterCard';
import { FeedItem, Profile } from './types/feedTypes';

interface AdminTileCarouselProps {
  adminFeed: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onContentLike?: (contentId: string, profileId: string) => Promise<void>;
  onContentShare?: (contentId: string) => Promise<void>;
  tilesToShow?: number;
  rotationIntervalMs?: number;
}

const AdminTileCarousel = memo<AdminTileCarouselProps>(({
  adminFeed,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
  tilesToShow = 2,
  rotationIntervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || adminFeed.length <= tilesToShow) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, adminFeed.length - tilesToShow);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [adminFeed.length, tilesToShow, rotationIntervalMs, isAutoRotating]);

  const handlePrevious = () => {
    setIsAutoRotating(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  const handleNext = () => {
    setIsAutoRotating(false);
    const maxIndex = Math.max(0, adminFeed.length - tilesToShow);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  if (!adminFeed.length) return null;

  const showNavigation = adminFeed.length > tilesToShow;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < adminFeed.length - tilesToShow;

  return (
    <div className="relative mb-6">
      {/* Navigation buttons */}
      {showNavigation && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 text-white hover:bg-black/80 ${
              !canGoPrev ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handlePrevious}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 text-white hover:bg-black/80 ${
              !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Carousel container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / tilesToShow)}%)`,
            width: `${(adminFeed.length / tilesToShow) * 100}%`
          }}
        >
          {adminFeed.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / adminFeed.length}%` }}
            >
              <ContentPromoterCard
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
                onContentLike={onContentLike}
                onContentShare={onContentShare}
                showAdminBadge={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {showNavigation && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil((adminFeed.length - tilesToShow + 1)) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={() => {
                setIsAutoRotating(false);
                setCurrentIndex(index);
                setTimeout(() => setIsAutoRotating(true), 3000);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

AdminTileCarousel.displayName = 'AdminTileCarousel';
export default AdminTileCarousel;
