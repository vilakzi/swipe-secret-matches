
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw, Settings } from 'lucide-react';
import { useEnhancedMatching } from '@/hooks/useEnhancedMatching';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const EnhancedProfileBrowser = () => {
  const {
    currentProfile,
    hasMoreProfiles,
    loading,
    handleSwipe,
    remainingSwipes,
    swipeLimit,
    loadPotentialMatches
  } = useEnhancedMatching();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Finding your perfect matches...</p>
      </div>
    );
  }

  if (!hasMoreProfiles || !currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <Card className="w-full max-w-md p-8 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900">No more profiles</h3>
            <p className="text-gray-600">
              You've seen all available profiles in your area. Try adjusting your preferences or check back later for new members!
            </p>
            
            <div className="space-y-3 pt-4">
              <Button 
                onClick={loadPotentialMatches}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Matches
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {/* Navigate to settings */}}
              >
                <Settings className="w-4 h-4 mr-2" />
                Adjust Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header with swipe counter */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>{remainingSwipes} / {swipeLimit} swipes today</span>
          {remainingSwipes <= 10 && (
            <Button size="sm" variant="outline" className="text-xs">
              Get Unlimited
            </Button>
          )}
        </div>
      </div>

      {/* Swipe Card */}
      <EnhancedSwipeCard
        profile={currentProfile}
        onSwipe={handleSwipe}
        remainingSwipes={remainingSwipes}
      />

      {/* Tips */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>💡 Swipe right to like, left to pass</p>
        <p>Tap the image to see more photos</p>
      </div>
    </div>
  );
};

export default EnhancedProfileBrowser;
