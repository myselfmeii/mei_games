import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

export const useSupabase = () => {
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }
    
    if (!supabaseInstance) {
      console.log('[Supabase] Creating new client instance');
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    
    return supabaseInstance;
  }, []);

  const [subscription, setSubscription] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const subscribeToRoom = useCallback((roomCode, callback) => {
    if (!supabase) {
      console.error('[Supabase] Client not available');
      return;
    }

    console.log(`[Supabase] Subscribing to room: ${roomCode}`);

    if (subscription) {
      console.log('[Supabase] Unsubscribing from previous channel');
      subscription.unsubscribe();
    }

    const channelName = `game-room-${roomCode}`;
    
    const newSubscription = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `room_code=eq.${roomCode}`
      }, (payload) => {
        console.log(`[Supabase] Received update for room ${roomCode}:`, payload);
        callback(payload);
      })
      .subscribe((status, err) => {
        console.log(`[Supabase] Subscription status for ${roomCode}:`, status);
        setConnectionStatus(status);
        
        if (err) {
          console.error(`[Supabase] Subscription error for ${roomCode}:`, err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase] Successfully subscribed to ${roomCode}`);
        }
      });

    setSubscription(newSubscription);
    
    
  }, [supabase, subscription]);

  const unsubscribeFromRoom = useCallback(() => {
    if (subscription) {
      console.log('[Supabase] Unsubscribing from room');
      subscription.unsubscribe();
      setSubscription(null);
      setConnectionStatus('disconnected');
    }
  }, [subscription]);

  useEffect(() => {
    return () => {
      unsubscribeFromRoom();
    };
  }, [unsubscribeFromRoom]);

  return { 
    supabase, 
    subscribeToRoom, 
    unsubscribeFromRoom,
    connectionStatus
  };
};
