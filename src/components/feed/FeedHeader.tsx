
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterGender: 'male' | 'female' | null;
  setFilterGender: (gender: 'male' | 'female' | null) => void;
}

const FeedHeader = ({ showFilters, setShowFilters, filterGender, setFilterGender }: FeedHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Feed</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-white"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {showFilters && (
        <div className="mt-3 flex items-center space-x-2">
          <Button
            variant={filterGender === null ? "default" : "ghost"}
            size="sm"
            className={filterGender === null ? "bg-purple-600" : "text-white"}
            onClick={() => setFilterGender(null)}
          >
            All
          </Button>
          <Button
            variant={filterGender === 'male' ? "default" : "ghost"}
            size="sm"
            className={filterGender === 'male' ? "bg-purple-600" : "text-white"}
            onClick={() => setFilterGender('male')}
          >
            Male
          </Button>
          <Button
            variant={filterGender === 'female' ? "default" : "ghost"}
            size="sm"
            className={filterGender === 'female' ? "bg-purple-600" : "text-white"}
            onClick={() => setFilterGender('female')}
          >
            Female
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedHeader;
