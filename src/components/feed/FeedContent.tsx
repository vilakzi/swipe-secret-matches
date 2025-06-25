
import React, { useState, useCallback, memo } from 'react';
import PostCard from './PostCard';
import FeedHeader from './FeedHeader';
import { toast } from '@/hooks/use-toast';

interface FeedContentProps {
  feedItems: any[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  engagementTracker?: any;
}

const FeedContent = memo<FeedContentProps>(({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh,
  engagementTracker,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFeedItems, setLocalFeedItems] = useState(feedItems);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setLocalFeedItems(feedItems);
  }, [feedItems]);

  const handleDeletePost = useCallback((itemId: string) => {
    setLocalFeedItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Post deleted",
      description: "The post has been removed from your feed.",
    });
  }, []);

  const handleRefreshFeed = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Feed refreshed",
        description: "Your feed has been updated with fresh content.",
      });
    } catch (error) {
      console.error('Error refreshing feed:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to refresh feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Safety check for feed items
  const safeFeedItems = Array.isArray(localFeedItems) ? localFeedItems : [];

  if (safeFeedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">No posts available</h3>
          <p className="text-gray-400 mb-4">
            {isRefreshing 
              ? "Loading fresh content..." 
              : "Be the first to share something amazing!"
            }
          </p>
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {safeFeedItems.map((item, index) => {
          // Ensure item has required properties
          if (!item?.id || !item?.profile) {
            console.warn('🎯 Skipping invalid feed item at index', index, item);
            return null;
          }

          // Add debug info for admin content
          if (item.profile?.role === 'admin' || item.isAdminPost) {
            console.debug(`🎯 Rendering admin content at position ${index}:`, item.profile?.name);
          }
          
          // Use displayKey for React key to prevent duplicates
          const reactKey = item.displayKey || `${item.id}-${index}`;
          
          return (
            <PostCard
              key={reactKey}
              item={item}
              likedItems={likedItems}
              isSubscribed={isSubscribed}
              onLike={onLike}
              onContact={onContact}
              onDelete={handleDeletePost}
              engagementTracker={engagementTracker}
            />
          );
        })}
      </div>

      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading fresh content...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FeedContent.displayName = 'FeedContent';
export default FeedContent;
