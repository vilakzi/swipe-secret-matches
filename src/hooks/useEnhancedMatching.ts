
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from '@/hooks/use-toast';

interface MatchingProfile {
  id: string;
  display_name: string;
  bio: string;
  age: number;
  location: string;
  interests: string[];
  profile_image_url: string;
  profile_images: string[];
  gender: string;
  last_active: string;
  user_type: 'user' | 'service_provider';
  distance?: number;
  compatibility_score?: number;
}

interface MatchingPreferences {
  min_age: number;
  max_age: number;
  max_distance: number;
  show_me: 'everyone' | 'men' | 'women' | 'service_providers';
  location_enabled: boolean;
}

export const useEnhancedMatching = () => {
  const [profiles, setProfiles] = useState<MatchingProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    min_age: 18,
    max_age: 50,
    max_distance: 50,
    show_me: 'everyone',
    location_enabled: true
  });
  const [dailySwipeCount, setDailySwipeCount] = useState(0);
  const [swipeLimit] = useState(50); // Daily swipe limit

  const { user } = useEnhancedAuth();

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          min_age: data.min_age || 18,
          max_age: data.max_age || 50,
          max_distance: data.max_distance || 50,
          show_me: data.show_me || 'everyone',
          location_enabled: data.location_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user]);

  // Calculate compatibility score based on interests
  const calculateCompatibility = (userInterests: string[], targetInterests: string[]): number => {
    if (!userInterests?.length || !targetInterests?.length) return 0;
    
    const commonInterests = userInterests.filter(interest => 
      targetInterests.includes(interest)
    );
    
    return Math.round((commonInterests.length / Math.max(userInterests.length, targetInterests.length)) * 100);
  };

  // Load potential matches
  const loadPotentialMatches = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's profile to filter matches
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        return;
      }

      // Get already swiped users to exclude them
      const { data: swipedUsers, error: swipedError } = await supabase
        .from('swipes')
        .select('target_user_id')
        .eq('user_id', user.id);

      if (swipedError) {
        console.error('Error loading swiped users:', swipedError);
      }

      const excludedIds = [user.id, ...(swipedUsers?.map(s => s.target_user_id) || [])];

      // Build query for potential matches
      let query = supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludedIds.join(',')})`)
        .eq('is_blocked', false)
        .order('last_active', { ascending: false })
        .limit(20);

      // Filter by age preferences
      if (preferences.min_age > 0) {
        query = query.gte('age', preferences.min_age);
      }
      if (preferences.max_age < 100) {
        query = query.lte('age', preferences.max_age);
      }

      // Filter by gender preferences
      if (preferences.show_me === 'men') {
        query = query.eq('gender', 'male');
      } else if (preferences.show_me === 'women') {
        query = query.eq('gender', 'female');
      } else if (preferences.show_me === 'service_providers') {
        query = query.eq('user_type', 'service_provider');
      }

      const { data: potentialMatches, error } = await query;

      if (error) {
        console.error('Error loading potential matches:', error);
        return;
      }

      if (potentialMatches) {
        // Calculate compatibility scores
        const matchesWithScores = potentialMatches.map(match => ({
          ...match,
          compatibility_score: calculateCompatibility(
            userProfile.interests || [],
            match.interests || []
          )
        }));

        // Sort by compatibility score and last activity
        const sortedMatches = matchesWithScores.sort((a, b) => {
          const scoreA = a.compatibility_score || 0;
          const scoreB = b.compatibility_score || 0;
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher compatibility first
          }
          
          return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
        });

        setProfiles(sortedMatches);
        setCurrentProfileIndex(0);
      }
    } catch (error) {
      console.error('Error loading potential matches:', error);
      toast({
        title: "Error loading matches",
        description: "Unable to load potential matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, preferences, calculateCompatibility]);

  // Handle swipe action
  const handleSwipe = useCallback(async (liked: boolean) => {
    if (!user || currentProfileIndex >= profiles.length) return;

    // Check daily swipe limit
    if (dailySwipeCount >= swipeLimit) {
      toast({
        title: "Daily swipe limit reached",
        description: "You've reached your daily swipe limit. Try again tomorrow or upgrade for unlimited swipes.",
        variant: "destructive"
      });
      return;
    }

    const targetProfile = profiles[currentProfileIndex];
    
    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: targetProfile.id,
          liked
        });

      if (swipeError) {
        console.error('Error recording swipe:', swipeError);
        toast({
          title: "Error",
          description: "Failed to record swipe. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Increment daily swipe counter
      setDailySwipeCount(prev => prev + 1);

      // Move to next profile
      setCurrentProfileIndex(prev => prev + 1);

      // If this was a like, check for mutual match
      if (liked) {
        const { data: mutualSwipe, error: mutualError } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetProfile.id)
          .eq('target_user_id', user.id)
          .eq('liked', true)
          .single();

        if (!mutualError && mutualSwipe) {
          // It's a match!
          toast({
            title: "It's a Match! 🎉",
            description: `You and ${targetProfile.display_name} liked each other!`,
          });

          // Create match record (handled by database trigger)
        }
      }

      // Load more profiles if running low
      if (currentProfileIndex >= profiles.length - 3) {
        setTimeout(loadPotentialMatches, 1000);
      }

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, currentProfileIndex, profiles, dailySwipeCount, swipeLimit, loadPotentialMatches]);

  // Load daily swipe count
  const loadDailySwipeCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      if (!error && data) {
        setDailySwipeCount(data.length);
      }
    } catch (error) {
      console.error('Error loading daily swipe count:', error);
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadDailySwipeCount();
    }
  }, [user, loadPreferences, loadDailySwipeCount]);

  useEffect(() => {
    if (user && preferences) {
      loadPotentialMatches();
    }
  }, [user, preferences, loadPotentialMatches]);

  const currentProfile = profiles[currentProfileIndex];
  const hasMoreProfiles = currentProfileIndex < profiles.length;
  const remainingSwipes = Math.max(0, swipeLimit - dailySwipeCount);

  return {
    currentProfile,
    hasMoreProfiles,
    loading,
    handleSwipe,
    preferences,
    setPreferences,
    dailySwipeCount,
    remainingSwipes,
    swipeLimit,
    loadPotentialMatches
  };
};
