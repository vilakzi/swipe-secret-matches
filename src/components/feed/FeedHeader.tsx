
import React from 'react';
import FeedHeaderActions from './FeedHeaderActions';
import FeedHeaderFilters from './FeedHeaderFilters';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onImageUpload: () => void;
  onVideoUpload: () => void;
  onRefresh?: () => void;
}

const FeedHeader = ({
  showFilters,
  setShowFilters,
  onImageUpload,
  onVideoUpload,
  onRefresh
}: FeedHeaderProps) => {
  return (
    <div className="space-y-4">
      <FeedHeaderActions
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onRefresh={onRefresh}
      />
      <FeedHeaderFilters showFilters={showFilters} />
    </div>
  );
};

export default FeedHeader;
