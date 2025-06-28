import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel = ({ isOpen, onClose }: FilterPanelProps) => {
  const { preferences, updatePreferences, loading } = useUserPreferences();

  if (!isOpen) return null;

  // Prevent rendering if preferences are not loaded yet
  if (!preferences) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardContent className="p-6 text-center text-gray-400">Loading preferences...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Discovery Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close filter panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div>
            <Label className="text-white font-medium">Age Range</Label>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{preferences.min_age}</span>
                <span>{preferences.max_age}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-400">Minimum Age</Label>
                  <Slider
                    value={[preferences.min_age ?? 18]}
                    onValueChange={([value]) => updatePreferences({ min_age: value })}
                    min={18}
                    max={65}
                    step={1}
                    className="mt-1"
                    disabled={loading}
                    aria-label="Minimum age"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Maximum Age</Label>
                  <Slider
                    value={[preferences.max_age ?? 65]}
                    onValueChange={([value]) => updatePreferences({ max_age: value })}
                    min={18}
                    max={65}
                    step={1}
                    className="mt-1"
                    disabled={loading}
                    aria-label="Maximum age"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <Label className="text-white font-medium">
              Maximum Distance: {preferences.max_distance}km
            </Label>
            <Slider
              value={[preferences.max_distance ?? 10]}
              onValueChange={([value]) => updatePreferences({ max_distance: value })}
              min={1}
              max={100}
              step={1}
              className="mt-2"
              disabled={loading}
              aria-label="Maximum distance"
            />
          </div>

          {/* Show Me */}
          <div>
            <Label className="text-white font-medium">Show Me</Label>
            <Select 
              value={preferences.show_me ?? "everyone"} 
              onValueChange={(value) => updatePreferences({ show_me: value as any })}
              disabled={loading}
            >
              <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Use My Location</Label>
              <p className="text-sm text-gray-400">Enable location-based matching</p>
            </div>
            <Switch
              checked={preferences.location_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences({ location_enabled: checked })}
              disabled={loading}
              aria-label="Enable location-based matching"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;
