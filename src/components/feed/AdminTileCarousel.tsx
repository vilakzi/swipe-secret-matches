
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  onContentLike: (contentId: string, profileId: string) => void;
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
  if (adminFeed.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Featured Content</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {adminFeed.map((item, index) => {
            const key = `${item.id || item.profile?.id || 'unknown'}-${index}`;
            
            return (
              <CarouselItem key={key} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                <div className="h-full">
                  {item.isContent ? (
                    <ContentProfileCard
                      item={item}
                      likedItems={likedItems}
                      onLike={(contentId: string) => onContentLike(contentId, item.profile?.id || '')}
                      onShare={onContentShare}
                    />
                  ) : item.type === 'post' ? (
                    <PostCard
                      item={item}
                      likedItems={likedItems}
                      isSubscribed={isSubscribed}
                      onLike={onLike}
                      onContact={onContact}
                    />
                  ) : item.type === 'profile' ? (
                    <ProfileCard
                      item={{
                        ...item,
                        profile: {
                          ...item.profile,
                          userType: ['admin', 'superadmin'].includes(item.profile.userType) 
                            ? 'service_provider' as const 
                            : item.profile.userType as "user" | "service_provider"
                        }
                      }}
                      likedItems={likedItems}
                      isSubscribed={isSubscribed}
                      onLike={onLike}
                      onContact={onContact}
                    />
                  ) : null}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {adminFeed.length > tilesToShow && (
          <>
            <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default AdminTileCarousel;
