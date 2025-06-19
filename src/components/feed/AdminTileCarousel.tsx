
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostCard from './PostCard';
import ProfileCard from './ProfileCard';
import ContentProfileCard from './ContentProfileCard';
import { FeedItem, Profile } from './types/feedTypes';

interface AdminTileCarouselProps {
  adminFeed: any[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onContentLike: (contentId: string) => void;
  onContentShare: (contentId: string) => void;
  tilesToShow: number;
  rotationIntervalMs: number;
}

const AdminTileCarousel: React.FC<AdminTileCarouselProps> = ({
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
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotation logic
  useEffect(() => {
    if (isPaused || adminFeed.length <= tilesToShow) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + tilesToShow) % adminFeed.length
      );
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [isPaused, adminFeed.length, tilesToShow, rotationIntervalMs]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 
        ? Math.max(0, adminFeed.length - tilesToShow)
        : Math.max(0, prevIndex - tilesToShow)
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + tilesToShow) % adminFeed.length
    );
  };

  if (adminFeed.length === 0) {
    return null;
  }

  const visibleItems = adminFeed.slice(currentIndex, currentIndex + tilesToShow);
  const showNavigation = adminFeed.length > tilesToShow;

  return (
    <div 
      className="relative bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 mb-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Featured Content</h2>
        {showNavigation && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleItems.map((item, index) => {
          const key = `${item.id || item.profile?.id || 'unknown'}-${currentIndex + index}`;
          
          if (item.isContent) {
            return (
              <ContentProfileCard
                key={key}
                item={item}
                onLike={onContentLike}
                onShare={onContentShare}
              />
            );
          }
          
          if (item.type === 'post') {
            return (
              <PostCard
                key={key}
                item={item}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            );
          }
          
          if (item.type === 'profile') {
            // Filter out admin/superadmin roles for ProfileCard compatibility
            const filteredItem = {
              ...item,
              profile: {
                ...item.profile,
                userType: ['admin', 'superadmin'].includes(item.profile.userType) 
                  ? 'service_provider' as const 
                  : item.profile.userType as "user" | "service_provider"
              }
            };
            
            return (
              <ProfileCard
                key={key}
                item={filteredItem}
                likedItems={likedItems}
                isSubscribed={isSubscribed}
                onLike={onLike}
                onContact={onContact}
              />
            );
          }
          
          return null;
        })}
      </div>

      {showNavigation && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(adminFeed.length / tilesToShow) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / tilesToShow) === index
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
              onClick={() => setCurrentIndex(index * tilesToShow)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTileCarousel;
