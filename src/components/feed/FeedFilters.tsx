import React from 'react';
import { Filter, SortAsc, Clock, ThumbsUp } from 'lucide-react';
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

interface FeedFiltersProps {
  currentSort: SortOption;
  currentFilter: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({
  currentSort,
  currentFilter,
  onSortChange,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 px-4">
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
  );
};

export default FeedFilters;