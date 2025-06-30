
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
    <div className="space-y-4 mb-4 px-4">
      {/* Filter and Sort Row */}
      <div className="flex items-center justify-between">
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

      {/* Location Navigation Buttons */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto">
        <Button
          variant={currentLocation === 'soweto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLocationClick('soweto')}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <MapPin className="h-3 w-3" />
          <span className="text-xs">Soweto Hookups</span>
        </Button>
        
        <Button
          variant={currentLocation === 'jhb-central' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLocationClick('jhb-central')}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <MapPin className="h-3 w-3" />
          <span className="text-xs">Jhb Central Hookups</span>
        </Button>
        
        <Button
          variant={currentLocation === 'pta' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLocationClick('pta')}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <MapPin className="h-3 w-3" />
          <span className="text-xs">PTA Hookups</span>
        </Button>
      </div>
    </div>
  );
};

export default FeedFilters;
