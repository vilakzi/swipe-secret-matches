import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { FeedItem } from './types/feedTypes';
import { Profile } from '@/types/profile';
import FeedPostCard from './FeedPostCard';
import ProfileCard from './ProfileCard';
import WelcomeCard from './WelcomeCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StableFeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
  onScrollActivity: () => void;
}

// Item height cache for dynamic sizing
const itemHeightCache: { [key: string]: number } = {};
const DEFAULT_ITEM_HEIGHT = 400;

// Measure item height based on content type
const getItemHeight = (index: number, item?: FeedItem): number => {
  if (!item) return DEFAULT_ITEM_HEIGHT;
  
  const cacheKey = `${item.type}-${item.id}`;
  
  if (itemHeightCache[cacheKey]) {
    return itemHeightCache[cacheKey];
  }
  
  // Estimate heights based on content type
  let estimatedHeight = DEFAULT_ITEM_HEIGHT;
  
  if (item.type === 'post') {
    estimatedHeight = 500; // Posts with images tend to be taller
    if (item.caption && item.caption.length > 100) {
      estimatedHeight += 40; // Add height for long captions
    }
  } else if (item.type === 'profile') {
    estimatedHeight = 380; // Profile cards are typically shorter
    if (item.profile.bio && item.profile.bio.length > 100) {
      estimatedHeight += 30; // Add height for long bios
    }
  } else if (item.type === 'welcome') {
    estimatedHeight = 200; // Welcome cards are compact
  }
  
  // Cache the estimated height
  itemHeightCache[cacheKey] = estimatedHeight;
  return estimatedHeight;
};

const FeedItemRenderer = memo(({ index, style, data }: any) => {
  const { items, likedItems, isSubscribed, onLike, onContact, isItemLoaded } = data;
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Measure actual height after render
  useEffect(() => {
    if (itemRef.current && items[index]) {
      const actualHeight = itemRef.current.offsetHeight;
      const cacheKey = `${items[index].type}-${items[index].id}`;
      
      if (Math.abs(itemHeightCache[cacheKey] - actualHeight) > 10) {
        itemHeightCache[cacheKey] = actualHeight;
      }
    }
  }, [index, items]);
  
  if (!isItemLoaded(index)) {
    return (
      <div style={style} className="px-4 py-2">
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>
    );
  }

  const item = items[index];
  if (!item) return null;

  return (
    <div style={style} ref={itemRef}>
      <div className="px-4 py-2">
        {item.type === 'post' && (
          <FeedPostCard
            key={`post-${item.id}`}
            post={{
              id: item.id,
              content_url: item.postImage,
              caption: item.caption,
              created_at: item.createdAt,
              profiles: item.profile
            }}
            isLiked={likedItems.has(item.id)}
            onLike={() => onLike(item.id, item.profile.id)}
            onContact={() => onContact(item.profile)}
            isSubscribed={isSubscribed}
          />
        )}
        
        {item.type === 'profile' && (
          <ProfileCard
            key={`profile-${item.id}`}
            profile={item.profile}
            isLiked={likedItems.has(item.profile.id)}
            onLike={() => onLike(item.profile.id, item.profile.id)}
            onContact={() => onContact(item.profile)}
            isSubscribed={isSubscribed}
          />
        )}
        
        {item.type === 'welcome' && (
          <WelcomeCard key={`welcome-${item.id}`} />
        )}
      </div>
    </div>
  );
});

FeedItemRenderer.displayName = 'FeedItemRenderer';

const StableFeedContent: React.FC<StableFeedContentProps> = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  hasMore,
  loadMore,
  isLoading,
  onScrollActivity
}) => {
  const [listHeight, setListHeight] = useState(600);
  const listRef = useRef<List>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Update list height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      const headerHeight = 120; // Approximate header height
      const bottomNavHeight = 80; // Approximate bottom nav height
      setListHeight(vh - headerHeight - bottomNavHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll activity tracking
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    onScrollActivity();
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout to detect when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      console.log('📱 User stopped scrolling');
    }, 1000);
  }, [onScrollActivity]);

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number): boolean => {
    return !!feedItems[index];
  }, [feedItems]);

  // Load more items when reaching end
  const loadMoreItems = useCallback(async () => {
    if (!isLoading && hasMore) {
      console.log('📱 Loading more items...');
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  const itemCount = hasMore ? feedItems.length + 1 : feedItems.length;
  
  const itemData = {
    items: feedItems,
    likedItems,
    isSubscribed,
    onLike,
    onContact,
    isItemLoaded
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      threshold={5} // Load more when 5 items from the end
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={(list) => {
            listRef.current = list;
            ref(list);
          }}
          height={listHeight}
          itemCount={itemCount}
          itemSize={(index) => getItemHeight(index, feedItems[index])}
          itemData={itemData}
          onItemsRendered={onItemsRendered}
          onScroll={handleScroll}
          overscanCount={2} // Render 2 extra items above and below viewport
          className="scrollbar-hide"
        >
          {FeedItemRenderer}
        </List>
      )}
    </InfiniteLoader>
  );
};

export default memo(StableFeedContent);