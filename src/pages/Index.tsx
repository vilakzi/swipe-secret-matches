
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WorkingFeed from '@/components/feed/WorkingFeed';
import ProfileBrowser from '@/components/browse/ProfileBrowser';
import ProfileCompletionChecker from '@/components/profile/ProfileCompletionChecker';
import AppHeader from '@/components/common/AppHeader';

const Index = () => {
  const isMobile = useIsMobile();
  const { user, loading } = useEnhancedAuth();
  const [viewMode, setViewMode] = useState<'feed' | 'browse'>('feed');

  console.log('Index component rendering - user:', user?.id, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ConnectsBuddy..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* Header */}
        <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          {user && <ProfileCompletionChecker />}
          {viewMode === 'feed' ? (
            <WorkingFeed />
          ) : (
            <ProfileBrowser />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
