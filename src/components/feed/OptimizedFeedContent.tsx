
import React, { memo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { FeedItem, Profile } from './types/feedTypes';
import FeedPostCard from './FeedPostCard';
import FeedProfileCard from './FeedProfileCard';
import WelcomeCard from './WelcomeCard';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedFeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
}

const ITEM_HEIGHT = 600; // Approximate height for feed items

const FeedItemRenderer = memo(({ index, style, data }: any) => {
  const { feedItems, likedItems, isSubscribed, onLike, onContact } = data;
  const item = feedItems[index];

  if (!item) {
    return (
      <div style={style} className="p-4">
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>
    );
  }

  const isWelcome = item.profile?.joinDate && 
    new Date(item.profile.joinDate) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <div style={style} className="p-2">
      {isWelcome ? (
        <WelcomeCard profile={item.profile} />
      ) : item.type === 'post' ? (
        <FeedPostCard
          item={item}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
        />
      ) : (
        <FeedProfileCard
          item={item}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
        />
      )}
    </div>
  );
});

FeedItemRenderer.displayName = 'FeedItemRenderer';

const OptimizedFeedContent = memo<OptimizedFeedContentProps>(({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  hasMore,
  loadMore,
  isLoading
}) => {
  const [listHeight, setListHeight] = useState(600);

  // Update list height based on viewport
  React.useEffect(() => {
    const updateHeight = () => {
      setListHeight(window.innerHeight - 200); // Account for header/navigation
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const itemCount = hasMore ? feedItems.length + 1 : feedItems.length;
  const isItemLoaded = useCallback((index: number) => !!feedItems[index], [feedItems]);

  const itemData = {
    feedItems,
    likedItems,
    isSubscribed,
    onLike,
    onContact
  };

  if (isLoading && feedItems.length === 0) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-96 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMore}
        threshold={5}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={listHeight}
            itemCount={itemCount}
            itemSize={ITEM_HEIGHT}
            onItemsRendered={onItemsRendered}
            itemData={itemData}
            overscanCount={2}
          >
            {FeedItemRenderer}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
});

OptimizedFeedContent.displayName = 'OptimizedFeedContent';

export default OptimizedFeedContent;
