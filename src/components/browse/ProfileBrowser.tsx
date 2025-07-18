import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Heart, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface Profile {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  profile_image_url: string;
  user_type: string;
  role: string;
  is_blocked: boolean;
}

interface FilterState {
  minAge: number;
  maxAge: number;
  location: string;
  interests: string[];
  userType: 'all' | 'user' | 'service_provider';
}

const ProfileBrowser = () => {
  const { user } = useEnhancedAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minAge: 18,
    maxAge: 65,
    location: '',
    interests: [],
    userType: 'all'
  });

  const loadProfiles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .eq('is_blocked', false);

      // Apply filters
      if (filters.minAge) query = query.gte('age', filters.minAge);
      if (filters.maxAge) query = query.lte('age', filters.maxAge);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.userType !== 'all') query = query.eq('user_type', filters.userType);

      const { data, error } = await query.limit(50);

      if (error) throw error;

      let filteredProfiles = data || [];

      // Apply search term filter
      if (searchTerm) {
        filteredProfiles = filteredProfiles.filter(profile =>
          profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [user, filters, searchTerm]);

  const handleLike = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user?.id,
          target_user_id: profileId,
          liked: true
        });

      if (error) throw error;
      
      // Remove from current view
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  const handlePass = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user?.id,
          target_user_id: profileId,
          liked: false
        });

      if (error) throw error;
      
      // Remove from current view
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  const getUserTypeDisplay = (userType: string, role: string) => {
    if (role === 'admin') return 'Admin';
    if (userType === 'service_provider') return 'Service Provider';
    return 'User';
  };

  const getUserTypeBadgeColor = (userType: string, role: string) => {
    if (role === 'admin') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (userType === 'service_provider') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading profiles..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Age Range</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) || 18 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-gray-400">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 65 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">User Type</label>
                <select
                  value={filters.userType}
                  onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value as FilterState['userType'] }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="all">All Users</option>
                  <option value="user">Regular Users</option>
                  <option value="service_provider">Service Providers</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  minAge: 18,
                  maxAge: 65,
                  location: '',
                  interests: [],
                  userType: 'all'
                })}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-gray-400 text-sm">
        Found {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">No Profiles Found</h3>
            <p className="text-gray-300 mb-4">
              Try adjusting your search criteria or filters to find more profiles.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  minAge: 18,
                  maxAge: 65,
                  location: '',
                  interests: [],
                  userType: 'all'
                });
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Reset Search
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="bg-gray-800 border-gray-700 overflow-hidden">
              <div className="relative">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.display_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profile.display_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3">
                  <Badge className={`${getUserTypeBadgeColor(profile.user_type, profile.role)} border`}>
                    {getUserTypeDisplay(profile.user_type, profile.role)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {profile.display_name}
                      {profile.age && <span className="text-gray-400 ml-2">• {profile.age}</span>}
                    </h3>
                    {profile.location && (
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                  
                  {profile.bio && (
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-700 text-gray-300"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {profile.interests.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          +{profile.interests.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePass(profile.id)}
                      className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Pass
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLike(profile.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileBrowser;