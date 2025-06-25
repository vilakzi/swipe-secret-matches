
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Image, Video, RotateCcw } from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';

interface FeedHeaderActionsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onRefresh?: () => void;
}

const FeedHeaderActions = ({
  showFilters,
  setShowFilters,
  onRefresh
}: FeedHeaderActionsProps) => {
  const { handleImageUpload, handleVideoUpload, maxSize, user } = useFileUpload(onRefresh);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="text-white hover:bg-white/10"
      >
        <Filter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        className="text-white hover:bg-white/10"
        title="Refresh Feed"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      {user && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
            className="text-white hover:bg-white/10"
            title={`Upload Image (max ${Math.round(maxSize / (1024*1024))}MB)`}
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVideoUpload}
            className="text-white hover:bg-white/10"
            title={`Upload Video (max ${Math.round(maxSize / (1024*1024))}MB)`}
          >
            <Video className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default FeedHeaderActions;
