
import * as React from 'react';
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
    { value: 'soweto' as LocationOption, label: 'Soweto Hookups', gradient: 'from-purple-500 to-pink-600' },
    { value: 'jhb-central' as LocationOption, label: 'Jhb Central Hookups', gradient: 'from-blue-500 to-cyan-600' },
    { value: 'pta' as LocationOption, label: 'PTA Hookups', gradient: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Post to Locations</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {locations.map((location) => (
          <button
            key={location.value}
            onClick={() => onLocationToggle(location.value)}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all whitespace-nowrap ${
              selectedLocations.includes(location.value)
                ? `bg-gradient-to-r ${location.gradient} text-white scale-105`
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:opacity-80'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>{location.label}</span>
          </button>
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
