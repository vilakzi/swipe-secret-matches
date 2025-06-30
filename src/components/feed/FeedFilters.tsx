import React from 'react';
import { Filter, SortAsc, Clock, ThumbsUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'newest' | 'oldest' | 'popular';
export type FilterOption = 'all' | 'posts' | 'profiles' | 'welcome' | 'admin';
export type LocationOption = 'all' | 'soweto' | 'jhb-central' | 'pta';

interface FeedFiltersProps {
  currentSort: SortOption;
  currentFilter: FilterOption;
  currentLocation?: LocationOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  onLocationChange?: (location: LocationOption) => void;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({
  currentSort,
  currentFilter,
  currentLocation = 'all',
  onSortChange,
  onFilterChange,
  onLocationChange,
}) => {
  const handleLocationClick = (location: LocationOption) => {
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Filter and Sort Row */}
      <div className="flex items-center justify-between px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter Feed</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={currentFilter === 'all' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onFilterChange('all')}
              >
                All Content
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentFilter === 'posts' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onFilterChange('posts')}
              >
                Posts Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentFilter === 'profiles' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onFilterChange('profiles')}
              >
                Profiles Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentFilter === 'welcome' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onFilterChange('welcome')}
              >
                New Joiners
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentFilter === 'admin' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onFilterChange('admin')}
              >
                Official Content
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort Feed</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={currentSort === 'newest' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onSortChange('newest')}
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Newest First</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentSort === 'oldest' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onSortChange('oldest')}
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Oldest First</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={currentSort === 'popular' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => onSortChange('popular')}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                <span>Most Popular</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sticky Location Navigation Buttons */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-md border-b border-gray-700 py-3">
        <div className="flex items-center justify-center gap-2 overflow-x-auto px-4">
          <button
            onClick={() => handleLocationClick('soweto')}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all whitespace-nowrap ${
              currentLocation === 'soweto'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white scale-105'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-purple-400 hover:to-pink-500'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Soweto Hookups</span>
          </button>
          
          <button
            onClick={() => handleLocationClick('jhb-central')}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all whitespace-nowrap ${
              currentLocation === 'jhb-central'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white scale-105'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-blue-400 hover:to-cyan-500'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Jhb Central Hookups</span>
          </button>
          
          <button
            onClick={() => handleLocationClick('pta')}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all whitespace-nowrap ${
              currentLocation === 'pta'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-emerald-400 hover:to-teal-500'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>PTA Hookups</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;
