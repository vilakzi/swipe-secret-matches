
import { Button } from '@/components/ui/button';
import { Filter, Image, Video } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterGender: 'male' | 'female' | null;
  setFilterGender: (gender: 'male' | 'female' | null) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  onImageUpload?: () => void;
  onVideoUpload?: () => void;
}

const FeedHeader = ({ 
  showFilters, 
  setShowFilters, 
  filterGender, 
  setFilterGender,
  onImageUpload,
  onVideoUpload
}: FeedHeaderProps) => {
  const { isServiceProvider, isAdmin } = useUserRole();
  const canUpload = isServiceProvider || isAdmin;

  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">Feed</h2>
        <div className="flex items-center space-x-2">
          {canUpload && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                onClick={onImageUpload}
              >
                <Image className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
                onClick={onVideoUpload}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </>
          )}
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
