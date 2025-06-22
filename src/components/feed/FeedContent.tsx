
import React, { useState } from 'react';
import PostCard from './PostCard';
import FeedHeader from './FeedHeader';

interface FeedContentProps {
  feedItems: any[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
}

const FeedContent = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh,
}: FeedContentProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFeedItems, setLocalFeedItems] = useState(feedItems);

  React.useEffect(() => {
    setLocalFeedItems(feedItems);
  }, [feedItems]);

  const handleDeletePost = (itemId: string) => {
    setLocalFeedItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onImageUpload={() => {}}
        onVideoUpload={() => {}}
        onRefresh={onRefresh}
      />

      <div className="space-y-4">
        {localFeedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No posts available</p>
          </div>
        ) : (
          localFeedItems.map((item) => (
            <PostCard
              key={item.id}
              item={item}
              likedItems={likedItems}
              isSubscribed={isSubscribed}
              onLike={onLike}
              onContact={onContact}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FeedContent;
