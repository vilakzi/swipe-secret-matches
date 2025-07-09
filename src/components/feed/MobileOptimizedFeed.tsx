import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOptimizedProfiles } from '@/hooks/useOptimizedProfiles';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EnhancedFeedCard from './EnhancedFeedCard';
import FeedStats from './FeedStats';
import { toast } from '@/hooks/use-toast';

const MobileOptimizedFeed = () => {
  const { profiles, loading, error, refetch, totalCount } = useOptimizedProfiles();
  const { role } = useUserRole();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: "Back online", description: "Connection restored" });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: "Offline", description: "Check your connection", variant: "destructive" });
    };

    // Check if navigator is available (client-side)
    if (typeof window !== 'undefined' && navigator) {
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleRefresh = async () => {
    if (!isOnline) {
      toast({ title: "Offline", description: "Cannot refresh while offline", variant: "destructive" });
      return;
    }
    
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: "Refreshed", description: "Feed updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh feed", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

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
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const serviceProviders = profiles.filter(p => p.user_type === 'service_provider').length;
  const newJoiners = profiles.filter(p => 
    new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className={`max-w-4xl mx-auto space-y-4 ${isMobile ? 'px-2' : 'px-6'}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isRefreshing || !isOnline}
          className="text-purple-400 hover:text-purple-300"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Feed Stats */}
      <FeedStats 
        totalProfiles={totalCount}
        serviceProviders={serviceProviders}
        newJoiners={newJoiners}
        userRole={role}
      />

      {/* Feed Header */}
      <div className="text-center mb-6">
        <h2 className={`font-bold text-white mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          {role === 'user' ? 'Service Providers' : role === 'service_provider' ? 'Users' : 'All Profiles'}
        </h2>
        <p className="text-gray-400 text-sm">
          Showing {profiles.length} profiles {role && `(viewing as ${role})`}
        </p>
      </div>

      {/* Profiles Feed */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-2">No Profiles Found</h3>
            <p className="text-gray-400 mb-6">
              No {role === 'user' ? 'service providers' : 'users'} found.
            </p>
            <Button onClick={handleRefresh} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </div>
        </div>
      ) : (
        <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          {profiles.map((profile) => (
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

export default MobileOptimizedFeed;