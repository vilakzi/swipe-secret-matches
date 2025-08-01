
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'offline';
}

export const usePresence = () => {
  try {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('online-users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = new Set<string>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: UserPresence) => {
            if (presence.status === 'online') {
              users.add(presence.user_id);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        newPresences.forEach((presence: UserPresence) => {
          if (presence.status === 'online') {
            setOnlineUsers(prev => new Set(prev).add(presence.user_id));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        leftPresences.forEach((presence: UserPresence) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(presence.user_id);
            return newSet;
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            status: 'online'
          });
        }
      });

    setChannel(presenceChannel);

    // Clean up on unmount or when user changes
    return () => {
      if (presenceChannel) {
        presenceChannel.untrack();
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user]);

  // Handle page visibility changes
  useEffect(() => {
    if (!channel || !user) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          status: 'offline'
        });
      } else {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          status: 'online'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [channel, user]);

    const isUserOnline = (userId: string) => onlineUsers.has(userId);

    return { isUserOnline, onlineUsers };
  } catch (error) {
    console.error('usePresence hook error:', error);
    // Return fallback values if context is not available
    return { 
      isUserOnline: () => false, 
      onlineUsers: new Set<string>() 
    };
  }
};
