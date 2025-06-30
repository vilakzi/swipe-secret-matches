
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import FeedFilters, { SortOption, FilterOption, LocationOption } from './FeedFilters';

interface FeedHeaderFiltersProps {
  showFilters: boolean;
}

const FeedHeaderFilters = ({ showFilters }: FeedHeaderFiltersProps) => {
  const [currentSort, setCurrentSort] = useState<SortOption>('newest');
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [currentLocation, setCurrentLocation] = useState<LocationOption>('soweto');

  const locations = [
    { value: 'soweto' as LocationOption, label: 'Soweto Hookups', gradient: 'from-purple-500 to-pink-600' },
    { value: 'jhb-central' as LocationOption, label: 'Jhb Central Hookups', gradient: 'from-blue-500 to-cyan-600' },
    { value: 'pta' as LocationOption, label: 'PTA Hookups', gradient: 'from-emerald-500 to-teal-600' },
  ];

  const handleLocationClick = (location: LocationOption) => {
    setCurrentLocation(location);
  };

  return (
    <div className="space-y-4">
      {/* Fixed Location Navigation Buttons - Now at the top */}
      <div className="fixed top-20 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-700 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 scrollbar-hide">
          {locations.map((location) => (
            <button
              key={location.value}
              onClick={() => handleLocationClick(location.value)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all duration-200 whitespace-nowrap transform ${
                currentLocation === location.value
                  ? `bg-gradient-to-r ${location.gradient} text-white scale-105`
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:opacity-80 hover:scale-105'
              }`}
            >
              <MapPin className="h-3 w-3" />
              <span>{location.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls - Only show when showFilters is true */}
      {showFilters && (
        <div className="mt-16 pt-4">
          <FeedFilters
            currentSort={currentSort}
            currentFilter={currentFilter}
            currentLocation={currentLocation}
            onSortChange={setCurrentSort}
            onFilterChange={setCurrentFilter}
            onLocationChange={setCurrentLocation}
          />
        </div>
      )}
    </div>
  );
};

export default FeedHeaderFilters;
