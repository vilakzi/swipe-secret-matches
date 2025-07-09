
import React from 'react';
import { Card } from "@/components/ui/card";
import { useSafeRealProfiles } from '@/hooks/useSafeRealProfiles';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const SimpleFeedCard = ({ profile }: { profile: any }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 mb-4 p-4">
      <div className="flex items-start space-x-4">
        <img
          src={profile.image}
          alt={`${profile.name}'s profile`}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
          <p className="text-sm text-gray-400">Age: {profile.age} • {profile.location}</p>
          <p className="text-sm text-gray-400">Type: {profile.userType}</p>
          {profile.bio && (
            <p className="text-sm text-gray-300 mt-2">{profile.bio}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const SimpleFeed = () => {
  const { realProfiles, loading, error, refetch } = useSafeRealProfiles();
  const { role, loading: roleLoading } = useUserRole();

  console.log('SimpleFeed rendering:', { 
    profilesCount: realProfiles.length, 
    loading, 
    error, 
    userRole: role 
  });

  if (loading || roleLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" text="Loading profiles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Profiles</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (realProfiles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-2">No Profiles Found</h3>
          <p className="text-gray-400 mb-4">There are no profiles in your database yet.</p>
          <button
            onClick={refetch}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Apply role-based filtering
  const filteredProfiles = realProfiles.filter(profile => {
    if (role === 'admin') return true; // Admins see all
    if (role === 'user') return profile.userType === 'service_provider'; // Users see service providers
    if (role === 'service_provider') return profile.userType === 'user'; // Service providers see users
    return true;
  });

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Your Feed</h2>
          <p className="text-gray-400 text-sm">
            Showing {filteredProfiles.length} profiles 
            {role && ` (viewing as ${role})`}
          </p>
        </div>
        
        {filteredProfiles.map((profile) => (
          <SimpleFeedCard key={profile.id} profile={profile} />
        ))}
        
        <div className="text-center py-4">
          <button
            onClick={refetch}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Refresh Feed
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleFeed;
