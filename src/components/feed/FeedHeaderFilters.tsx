
import React from 'react';

interface FeedHeaderFiltersProps {
  showFilters: boolean;
}

const FeedHeaderFilters = ({ showFilters }: FeedHeaderFiltersProps) => {
  if (!showFilters) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
      <h3 className="text-white font-medium">Filters</h3>
      <div className="text-gray-400 text-sm">Feed filtering is disabled. All content is shown uniformly.</div>
    </div>
  );
};

export default FeedHeaderFilters;
