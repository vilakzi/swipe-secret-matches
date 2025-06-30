
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export type LocationOption = 'all' | 'soweto' | 'jhb-central' | 'pta';

interface LocationSelectorProps {
  selectedLocations: LocationOption[];
  onLocationToggle: (location: LocationOption) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationToggle,
  className = ""
}) => {
  const locations = [
    { value: 'soweto' as LocationOption, label: 'Soweto Hookups' },
    { value: 'jhb-central' as LocationOption, label: 'Jhb Central Hookups' },
    { value: 'pta' as LocationOption, label: 'PTA Hookups' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Post to Locations</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {locations.map((location) => (
          <Button
            key={location.value}
            variant={selectedLocations.includes(location.value) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLocationToggle(location.value)}
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{location.label}</span>
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        {selectedLocations.length === 0 
          ? "Select locations where this post should appear" 
          : `Will appear in: ${selectedLocations.map(loc => locations.find(l => l.value === loc)?.label).join(', ')}`
        }
      </p>
    </div>
  );
};

export default LocationSelector;
