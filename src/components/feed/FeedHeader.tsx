
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterGender: 'male' | 'female' | null;
  setFilterGender: (gender: 'male' | 'female' | null) => void;
  filterName: string;
  setFilterName: (name: string) => void;
}

const FeedHeader = ({ 
  showFilters, 
  setShowFilters, 
  filterGender, 
  setFilterGender,
  filterName,
  setFilterName
}: FeedHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
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

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
        />
      </div>
      
      {showFilters && (
        <div className="flex items-center space-x-2">
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
