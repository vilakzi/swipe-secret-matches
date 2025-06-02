
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import { useFeedData } from '@/hooks/useFeedData';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: number) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = ({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    filterGender,
    filterName,
    handleLoadMore,
    handleFilterChange,
    handleNameFilterChange,
    handleRefresh
  } = useFeedData(6);

  const handlePullRefresh = useCallback(async () => {
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
  }, [handleRefresh, onRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 overflow-x-hidden">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterGender={filterGender}
        setFilterGender={handleFilterChange}
        filterName={filterName}
        setFilterName={handleNameFilterChange}
      />
      
      <div className="max-w-md mx-auto">
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-20">
          <InfiniteScroll
            hasMore={hasMoreItems}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
          >
            <FeedContent
              feedItems={displayedItems}
              likedItems={likedItems}
              isSubscribed={true}
              filterGender={filterGender}
              onLike={onLike}
              onContact={onContact}
              onRefresh={onRefresh}
              setFilterGender={handleFilterChange}
            />
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default InstagramFeed;
