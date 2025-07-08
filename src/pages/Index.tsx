import React, { useState, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRealProfiles } from '@/hooks/useRealProfiles';
import { useEnhancedMatching } from '@/hooks/useEnhancedMatching';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import Feedpage from '@/components/feed/Feedpage';
import MobileOptimizedFeed from '@/components/mobile/MobileOptimizedFeed';
import EnhancedProfileBrowser from '@/components/browse/EnhancedProfileBrowser';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: "male" | "female";
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  userType?: string;
  role?: string;
}

const Index = () => {
  const isMobile = useIsMobile();
  const { profiles, loading, error, refetch } = useRealProfiles();
  const { 
    handleLike,
    handleSuperLike,
    handleSwipe,
    likedProfiles,
    isSubscribed,
    engagementTracker 
  } = useEnhancedMatching();

  const {
    config: mobileConfig,
    shouldUseAnimation,
    shouldOptimizeImages,
  } = useMobileOptimization({
    enablePullToRefresh: true,
    enableSwipeGestures: true,
    enableHapticFeedback: true,
    optimizeImages: true,
  });

  // Offline storage for critical data
  const {
    data: cachedProfiles,
    saveOffline,
    isOnline,
  } = useOfflineStorage<any[]>({
    key: 'profiles_cache',
    initialData: [],
    syncOnOnline: true,
  });

  const [viewMode, setViewMode] = useState<'feed' | 'browse'>('feed');

  // Use cached profiles if offline and no fresh data
  const displayProfiles = useMemo(() => {
    if (!isOnline && cachedProfiles.length > 0 && profiles.length === 0) {
      return cachedProfiles;
    }
    return profiles;
  }, [profiles, cachedProfiles, isOnline]);

  // Cache profiles when online
  React.useEffect(() => {
    if (profiles.length > 0 && isOnline) {
      saveOffline(profiles);
    }
  }, [profiles, saveOffline, isOnline]);

  const handleContact = useCallback((profile: any) => {
    if (profile.whatsapp) {
      const message = encodeURIComponent(`Hi ${profile.name}! I found your profile on Connect and would love to chat.`);
      const whatsappUrl = `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading profiles...</h2>
          <p className="text-gray-400 mt-2">
            {!isOnline && "You're offline - showing cached content"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-400">Error Loading Profiles</h2>
          <p className="text-gray-400 mt-2 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile-optimized interface
  if (isMobile && mobileConfig.enableSwipeGestures) {
    return (
      <MobileOptimizedFeed
        profiles={displayProfiles}
        onLike={handleLike}
        onContact={handleContact}
        onRefresh={handleRefresh}
        likedItems={likedProfiles}
        isSubscribed={isSubscribed}
        engagementTracker={engagementTracker}
      />
    );
  }

  // Desktop or mobile feed mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* View Mode Toggle */}
      <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'feed'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setViewMode('browse')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'browse'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Browse
          </button>
        </div>
        
        {!isOnline && (
          <div className="text-center mt-2">
            <span className="text-yellow-400 text-sm">⚠ Offline Mode</span>
          </div>
        )}
      </div>

      {viewMode === 'feed' ? (
        <Feedpage />
      ) : (
        <EnhancedProfileBrowser />
      )}
    </div>
  );
};

export default Index;
