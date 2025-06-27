
import FeedHeaderActions from './FeedHeaderActions';
import FeedHeaderFilters from './FeedHeaderFilters';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onRefresh?: () => void;
  onImageUpload?: () => void;
  onVideoUpload?: () => void;
}

const FeedHeader = ({
  showFilters,
  setShowFilters,
  onRefresh,
  onImageUpload,
  onVideoUpload
}: FeedHeaderProps) => {
  return (
    <div className="space-y-4">
      <FeedHeaderActions
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onRefresh={onRefresh}
        onImageUpload={onImageUpload}
        onVideoUpload={onVideoUpload}
      />
      <FeedHeaderFilters showFilters={showFilters} />
    </div>
  );
};

export default FeedHeader;
