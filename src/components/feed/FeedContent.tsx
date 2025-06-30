
import * as React from 'react';
import { useState, useMemo } from 'react';
import AdminTileCarousel from './AdminTileCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { useContentFeed } from '@/hooks/useContentFeed';
import { useUserRole } from '@/hooks/useUserRole';
// Utility imports
import { isValidMedia } from '@/utils/feed/mediaUtils';
import { isProfileImageChanged } from '@/utils/feed/profileUtils';
import { isNewJoiner } from '@/utils/feed/joinerUtils';
import { FeedItem, Profile } from './types/feedTypes';
import NormalFeedList from './NormalFeedList';
import FeedFilters, { SortOption, FilterOption, LocationOption } from './FeedFilters';

interface FeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onRefresh?: () => void;
  engagementTracker?: any;
}

const FeedContent = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh,
  engagementTracker
}: FeedContentProps) => {
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [locationOption, setLocationOption] = useState<LocationOption>('all');
  const { contentFeedItems, handleContentLike, handleContentShare } = useContentFeed();
  const { user } = useAuth();
  const { role } = useUserRole();

  const adminRoles = ["admin", "superadmin"];

  // Create wrapper functions to match expected signatures
  const handleContentLikeWrapper = async (contentId: string, profileId: string) => {
    handleContentLike(contentId, profileId);
  };

  const handleContentShareWrapper = async (contentId: string) => {
    handleContentShare(contentId);
  };

  // Optimized feed processing with memoization
  const processedFeedData = useMemo(() => {
    console.log('🚀 Processing feed data with optimization');
    
    // Enrich feed items with role/joinDate for easier checks
    const enrichedFeedItems = feedItems.map(item => ({
      ...item,
      isAdminCard: false,
      profile: {
        ...item.profile,
        role: item.profile.role || item.profile.userType,
        joinDate: item.profile.joinDate
      }
    }));

    // Convert content feed items to FeedItem type compatible format
    const contentAsRegularFeed = contentFeedItems.filter(
      c => !!c && !!c.id && isValidMedia(c.postImage)
    ).map(item => ({
      ...item,
      isContent: true,
      isAdminCard: true,
      // Ensure the profile matches FeedItem's Profile type
      profile: {
        ...item.profile,
        userType: item.profile.userType as "user" | "service_provider" | "admin" | "superadmin"
      }
    } as FeedItem & { isContent: true; isAdminCard: true }));

    // Admin carousel: posts from admin/superadmin, and published content feed
    const adminFeed = [
      ...contentAsRegularFeed,
      ...enrichedFeedItems.filter(item =>
        adminRoles.includes(String(item.profile.role).toLowerCase()) &&
        ((item.type === 'post' && isValidMedia(item.postImage)) ||
          (item.type === 'profile' && isProfileImageChanged(item.profile.image)))
      ).map(item => ({
        ...item,
        isAdminCard: true
      }))
    ];

    // All feed items combined for normal display
    const allFeedItems = [
      ...contentAsRegularFeed,
      ...enrichedFeedItems.filter(item => {
        const hasMedia = (item.profile.posts && item.profile.posts.some(isValidMedia)) || 
                        (item.type === 'post' && isValidMedia(item.postImage));
        const imgChanged = isProfileImageChanged(item.profile.image);
        const newJoiner = isNewJoiner(item.profile.joinDate);
        
        return hasMedia || imgChanged || newJoiner;
      }).map(item => ({
        ...item,
        isWelcome: isNewJoiner(item.profile.joinDate) && 
                   (!item.profile.posts || item.profile.posts.length === 0) && 
                   !isProfileImageChanged(item.profile.image)
      }))
    ];

    return { adminFeed, allFeedItems };
  }, [feedItems, contentFeedItems, adminRoles]);

  // Optimized location filtering with better performance
  const filterByLocation = useMemo(() => {
    return (items: any[]) => {
      if (locationOption === 'all') return items;
      
      return items.filter(item => {
        // Check if item has location metadata from upload
        if (item.locationMetadata?.target_locations) {
          return item.locationMetadata.target_locations.includes(locationOption);
        }
        
        // Optimized profile location matching
        const location = item.profile?.location?.toLowerCase() || '';
        switch (locationOption) {
          case 'soweto':
            return location.includes('soweto');
          case 'jhb-central':
            return location.includes('johannesburg') || location.includes('jhb') || location.includes('central');
          case 'pta':
            return location.includes('pretoria') || location.includes('pta');
          default:
            return true;
        }
      });
    };
  }, [locationOption]);

  // Optimized sorting with performance improvements
  const sortFeedItems = useMemo(() => {
    return (items: any[]) => {
      switch (sortOption) {
        case 'oldest':
          return [...items].sort((a, b) => 
            new Date(a.createdAt || a.timestamp || 0).getTime() - 
            new Date(b.createdAt || b.timestamp || 0).getTime()
          );
        case 'popular':
          return [...items].sort((a, b) => 
            (b.likes?.length || 0) - (a.likes?.length || 0)
          );
        case 'newest':
        default:
          return [...items].sort((a, b) => 
            new Date(b.createdAt || b.timestamp || 0).getTime() - 
            new Date(a.createdAt || a.timestamp || 0).getTime()
          );
      }
    };
  }, [sortOption]);

  // Optimized filtering logic
  const filterFeedItems = useMemo(() => {
    return (items: any[]) => {
      switch (filterOption) {
        case 'posts':
          return items.filter(item => item.type === 'post');
        case 'profiles':
          return items.filter(item => item.type === 'profile');
        case 'welcome':
          return items.filter(item => item.isWelcome);
        case 'admin':
          return items.filter(item => item.isAdminCard);
        case 'all':
        default:
          return items;
      }
    };
  }, [filterOption]);

  // Apply all filters with performance optimization
  const processedFeedItems = useMemo(() => {
    console.log('🚀 Applying filters with optimization');
    return sortFeedItems(filterFeedItems(filterByLocation(processedFeedData.allFeedItems)));
  }, [processedFeedData.allFeedItems, filterByLocation, filterFeedItems, sortFeedItems]);

  const processedAdminFeed = useMemo(() => {
    return filterByLocation(processedFeedData.adminFeed);
  }, [processedFeedData.adminFeed, filterByLocation]);

  console.log('🚀 Feed processing complete:', {
    total: processedFeedItems.length,
    admin: processedAdminFeed.length,
    location: locationOption,
    filter: filterOption,
    sort: sortOption
  });

  return (
    <div className="space-y-6 pb-6" role="list" aria-label="Social feed items">
      <FeedFilters 
        currentSort={sortOption}
        currentFilter={filterOption}
        currentLocation={locationOption}
        onSortChange={setSortOption}
        onFilterChange={setFilterOption}
        onLocationChange={setLocationOption}
      />
      
      {processedAdminFeed.length > 0 && filterOption !== 'posts' && filterOption !== 'profiles' && (
        <AdminTileCarousel
          adminFeed={processedAdminFeed}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
          onContentLike={handleContentLikeWrapper}
          onContentShare={handleContentShareWrapper}
          tilesToShow={2}
          rotationIntervalMs={5000}
        />
      )}
      
      <NormalFeedList
        userFeed={processedFeedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
      />
    </div>
  );
};

export default FeedContent;
