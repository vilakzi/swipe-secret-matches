import React from 'react';
import { useOptimizedProfiles } from '@/hooks/useOptimizedProfiles';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EnhancedFeedCard from './EnhancedFeedCard';
import FeedStats from './FeedStats';
import { toast } from '@/hooks/use-toast';

const SimpleFeed = () => {
  const { profiles, loading, error, refetch, totalCount } = useOptimizedProfiles();
  const { role } = useUserRole();

  const handleLike = async (profileId: string) => {
    toast({ title: "Profile liked!", description: "Your like has been recorded" });
  };

  const handleContact = async (profile: any) => {
    if (profile.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp}`, '_blank');
    } else {
      toast({
        title: "Contact Info",
        description: "No contact information available",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your feed..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Feed</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const serviceProviders = Array.isArray(profiles) ? profiles.filter(p => p.user_type === 'service_provider').length : 0;
  const newJoiners = Array.isArray(profiles) ? profiles.filter(p => 
    new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      {/* Feed Stats */}
      <FeedStats 
        totalProfiles={totalCount}
        serviceProviders={serviceProviders}
        newJoiners={newJoiners}
        userRole={role}
      />

      {/* Feed Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Discover Profiles
        </h2>
        <p className="text-gray-400 text-sm">
          Showing {Array.isArray(profiles) ? profiles.length : 0} profiles
        </p>
      </div>

      {/* Profiles Feed */}
      {!Array.isArray(profiles) || profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-2">No Profiles Found</h3>
            <p className="text-gray-400 mb-6">
              No profiles found.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(profiles) && profiles.map((profile) => (
            <EnhancedFeedCard
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onContact={handleContact}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleFeed;