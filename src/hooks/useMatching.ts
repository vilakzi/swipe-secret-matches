import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  is_super_like: boolean;
  expires_at: string;
}

interface MatchWithProfile extends Match {
  profile: {
    id: string;
    display_name: string;
    profile_image_url: string;
    bio: string;
    age: number;
    location: string;
    user_type: string;
    role: string;
  };
}

export const useMatching = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: matchData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profile data for each match
      const matchesWithProfiles = await Promise.all(
        (matchData || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, profile_image_url, bio, age, location, user_type, role')
            .eq('id', otherUserId)
            .single();

          if (profileError) {
            console.error('Error fetching profile for match:', profileError);
            return null;
          }

          return {
            ...match,
            profile: profileData
          };
        })
      );

      setMatches(matchesWithProfiles.filter(Boolean) as MatchWithProfile[]);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error loading matches",
        description: "Failed to load your matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const swipeProfile = async (targetUserId: string, liked: boolean) => {
    if (!user) return;

    try {
      // Check if already swiped on this user
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single();

      if (existingSwipe) {
        toast({
          title: "Already swiped",
          description: "You've already swiped on this profile.",
          variant: "destructive",
        });
        return false;
      }

      // Insert swipe record
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          liked
        });

      if (swipeError) throw swipeError;

      if (liked) {
        // Check if the other user also liked this user (creating a match)
        const { data: reciprocalSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', user.id)
          .eq('liked', true)
          .single();

        if (reciprocalSwipe) {
          toast({
            title: "It's a match! 🎉",
            description: "You and this user liked each other!",
          });
          
          // Reload matches to show the new match
          await loadMatches();
        } else {
          toast({
            title: "Like sent! ❤️",
            description: "You'll be notified if they like you back.",
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error swiping:', error);
      toast({
        title: "Error",
        description: "Failed to record your swipe. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const superLike = async (targetUserId: string) => {
    if (!user) return false;

    try {
      // Check if already super liked this user
      const { data: existingSuperLike } = await supabase
        .from('super_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single();

      if (existingSuperLike) {
        toast({
          title: "Already super liked",
          description: "You've already super liked this profile.",
          variant: "destructive",
        });
        return false;
      }

      // Insert super like record
      const { error } = await supabase
        .from('super_likes')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId
        });

      if (error) throw error;

      // Also create a regular swipe record
      await swipeProfile(targetUserId, true);

      toast({
        title: "Super Like sent! ⭐",
        description: "Your super like has been sent!",
      });

      return true;
    } catch (error) {
      console.error('Error super liking:', error);
      toast({
        title: "Error",
        description: "Failed to send super like. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const unmatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.filter(match => match.id !== matchId));
      
      toast({
        title: "Unmatched",
        description: "You have unmatched with this user.",
      });
    } catch (error) {
      console.error('Error unmatching:', error);
      toast({
        title: "Error",
        description: "Failed to unmatch. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscription for new matches
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New match received:', payload);
          loadMatches(); // Reload matches when new one is created
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    loadMatches();
  }, [user]);

  return {
    matches,
    loading,
    swipeProfile,
    superLike,
    unmatch,
    loadMatches
  };
};