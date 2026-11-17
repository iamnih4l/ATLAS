'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useAtlasStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export function useDataSync() {
  const { user, isInitialized } = useAuth();
  const isSyncingRef = useRef(false);
  const hasMigratedLocalRef = useRef(false);

  const {
    experiences,
    wishlistItems,
    adventures,
    userPreferences,
    setExperiences,
    setWishlistItems,
    setLocations,
    setAdventures,
    setUserPreferences,
  } = useAtlasStore();

  const syncData = useCallback(async (forceMigration = false) => {
    if (!user || user.isGuest || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;

      // Check if there are local pins that need migration to server
      const hasUnsyncedExperiences = experiences.some(
        (e) => !e.id || e.id.startsWith('exp-') || e.user_id === 'demo-user' || e.user_id !== user.id
      );
      const hasUnsyncedWishlist = wishlistItems.some(
        (w) => !w.id || w.id.startsWith('wish-') || w.user_id === 'guest-user' || w.user_id !== user.id
      );

      const needsMigration = forceMigration || (!hasMigratedLocalRef.current && (hasUnsyncedExperiences || hasUnsyncedWishlist));

      if (needsMigration) {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            localExperiences: experiences,
            localWishlistItems: wishlistItems,
            localAdventures: adventures,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setExperiences(data.experiences || []);
            setWishlistItems(data.wishlistItems || []);
            setLocations(data.locations || []);
            if (data.adventures) setAdventures(data.adventures);
            if (data.preferences) setUserPreferences(data.preferences);
            if (data.profile?.fullName) {
              useAuth.getState().updateUser({ fullName: data.profile.fullName });
            }
            hasMigratedLocalRef.current = true;
          }
        }
      } else {
        // Fast authoritative GET
        const res = await fetch('/api/sync');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setExperiences(data.experiences || []);
            setWishlistItems(data.wishlistItems || []);
            setLocations(data.locations || []);
            if (data.adventures) setAdventures(data.adventures);
            if (data.preferences) setUserPreferences(data.preferences);
            if (data.profile?.fullName) {
              useAuth.getState().updateUser({ fullName: data.profile.fullName });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Atlas data synchronization warning:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    user,
    experiences,
    wishlistItems,
    adventures,
    userPreferences,
    setExperiences,
    setWishlistItems,
    setLocations,
    setAdventures,
    setUserPreferences,
  ]);

  // Trigger sync on login / user session change
  useEffect(() => {
    if (isInitialized && user && !user.isGuest) {
      syncData();
    }
  }, [isInitialized, user, syncData]);

  // Window focus & online reconnect listeners
  useEffect(() => {
    if (!user || user.isGuest) return;

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncData();
      }
    };

    const handleOnline = () => {
      syncData();
    };

    window.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
      window.removeEventListener('online', handleOnline);
    };
  }, [user, syncData]);

  // Supabase Realtime channel subscription for instant cross-device updates
  useEffect(() => {
    if (!user || user.isGuest) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`atlas-user-sync-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'experiences', filter: `user_id=eq.${user.id}` },
          () => {
            syncData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wishlist_items', filter: `user_id=eq.${user.id}` },
          () => {
            syncData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'adventures', filter: `user_id=eq.${user.id}` },
          () => {
            syncData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_preferences', filter: `user_id=eq.${user.id}` },
          () => {
            syncData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel subscription skipped:', err);
    }
  }, [user, syncData]);

  return { syncData };
}
