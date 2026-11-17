'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './use-auth';
import { useAtlasStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Experience, WishlistItem, Adventure, Location } from '@/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(id?: string | null): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Non-destructive merge: keeps all authoritative server records,
 * and preserves any unsynced local records (temp IDs or offline creations)
 * that have not yet been persisted to Supabase — NEVER silently drops user pins.
 */
function mergeRecords<T extends { id: string; title?: string; user_id?: string }>(
  serverItems: T[],
  localItems: T[],
  userId: string
): T[] {
  const merged = [...serverItems];
  const serverIds = new Set(serverItems.map((item) => item.id));
  const serverTitles = new Set(
    serverItems.map((item) => (item.title || '').trim().toLowerCase()).filter(Boolean)
  );

  for (const local of localItems) {
    // Already present by exact ID
    if (serverIds.has(local.id)) continue;

    // If this is an unsynced/local-only record (non-UUID or non-matching user_id),
    // preserve it unless an equivalent title was already migrated to server.
    const isLocalUnsynced = !isUuid(local.id) || local.user_id !== userId;
    if (isLocalUnsynced) {
      const normalizedTitle = (local.title || '').trim().toLowerCase();
      if (!normalizedTitle || !serverTitles.has(normalizedTitle)) {
        merged.push(local);
      }
    }
  }

  return merged;
}

function mergeLocations(
  serverLocations: Location[],
  localLocations: Location[],
  experiences: Experience[],
  wishlistItems: WishlistItem[],
  adventures: Adventure[]
): Location[] {
  const locMap = new Map<string, Location>();

  for (const loc of serverLocations) {
    if (loc?.id) locMap.set(loc.id, loc);
  }

  // Keep local locations that are still referenced by any preserved item
  const referencedIds = new Set<string>();
  experiences.forEach((e) => {
    if (e.location_id) referencedIds.add(e.location_id);
    if (e.location?.id) locMap.set(e.location.id, e.location);
  });
  wishlistItems.forEach((w) => {
    if (w.location_id) referencedIds.add(w.location_id);
    if (w.location?.id) locMap.set(w.location.id, w.location);
  });
  adventures.forEach((a) => {
    (a.destinations || []).forEach((d) => {
      if (d.location_id) referencedIds.add(d.location_id);
      if (d.location?.id) locMap.set(d.location.id, d.location);
    });
  });

  for (const loc of localLocations) {
    if (loc?.id && referencedIds.has(loc.id) && !locMap.has(loc.id)) {
      locMap.set(loc.id, loc);
    }
  }

  return Array.from(locMap.values());
}

function saveSafetyBackup(state: {
  experiences: Experience[];
  wishlistItems: WishlistItem[];
  adventures: Adventure[];
  locations: Location[];
}) {
  if (typeof window === 'undefined') return;
  const totalCount =
    state.experiences.length + state.wishlistItems.length + state.adventures.length;
  if (totalCount === 0) return;

  try {
    localStorage.setItem(
      'atlas_safety_backup_v1',
      JSON.stringify({
        savedAt: new Date().toISOString(),
        experiences: state.experiences,
        wishlistItems: state.wishlistItems,
        adventures: state.adventures,
        locations: state.locations,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function useDataSync() {
  const { user, isInitialized } = useAuth();
  const isSyncingRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(() =>
    typeof window !== 'undefined' ? useAtlasStore.persist.hasHydrated() : false
  );

  // Wait for Zustand persist hydration before running ANY cloud sync
  useEffect(() => {
    if (useAtlasStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }
    const unsub = useAtlasStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    return () => {
      unsub();
    };
  }, []);

  const syncData = useCallback(
    async (forceMigration = false) => {
      if (!user || user.isGuest || isSyncingRef.current) return;
      if (!useAtlasStore.persist.hasHydrated()) return;

      try {
        isSyncingRef.current = true;

        // Always read freshest store state directly to prevent stale closures
        const current = useAtlasStore.getState();

        // Snapshot non-empty local state as a safety net before syncing
        saveSafetyBackup({
          experiences: current.experiences,
          wishlistItems: current.wishlistItems,
          adventures: current.adventures,
          locations: current.locations,
        });

        // Check ALL collections for unsynced local records
        const hasUnsyncedExperiences = current.experiences.some(
          (e) => !isUuid(e.id) || e.user_id !== user.id
        );
        const hasUnsyncedWishlist = current.wishlistItems.some(
          (w) => !isUuid(w.id) || w.user_id !== user.id
        );
        const hasUnsyncedAdventures = current.adventures.some(
          (a) => !isUuid(a.id) || a.user_id !== user.id
        );

        const needsMigration =
          forceMigration ||
          hasUnsyncedExperiences ||
          hasUnsyncedWishlist ||
          hasUnsyncedAdventures;

        const res = needsMigration
          ? await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                localExperiences: current.experiences,
                localWishlistItems: current.wishlistItems,
                localAdventures: current.adventures,
                localLocations: current.locations,
              }),
            })
          : await fetch('/api/sync');

        if (!res.ok) return;

        const data = await res.json();
        if (!data.success) return;

        // Re-read freshest store state right before applying merge (in case user added a pin mid-flight)
        const latest = useAtlasStore.getState();

        const mergedExperiences = mergeRecords<Experience>(
          data.experiences || [],
          latest.experiences,
          user.id
        );
        const mergedWishlist = mergeRecords<WishlistItem>(
          data.wishlistItems || [],
          latest.wishlistItems,
          user.id
        );
        const mergedAdventures = mergeRecords<Adventure>(
          data.adventures || [],
          latest.adventures,
          user.id
        );
        const mergedLocations = mergeLocations(
          data.locations || [],
          latest.locations,
          mergedExperiences,
          mergedWishlist,
          mergedAdventures
        );

        latest.setExperiences(mergedExperiences);
        latest.setWishlistItems(mergedWishlist);
        latest.setAdventures(mergedAdventures);
        latest.setLocations(mergedLocations);

        if (data.preferences) {
          latest.setUserPreferences(data.preferences);
        }
        if (data.profile?.fullName) {
          useAuth.getState().updateUser({ fullName: data.profile.fullName });
        }
      } catch (err) {
        console.warn('Atlas data synchronization warning:', err);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [user]
  );

  // Trigger sync ONLY after both Auth AND Zustand localStorage hydration are complete
  useEffect(() => {
    if (isInitialized && isHydrated && user && !user.isGuest) {
      syncData();
    }
  }, [isInitialized, isHydrated, user?.id, syncData]);

  // Window focus & online reconnect listeners
  useEffect(() => {
    if (!isHydrated || !user || user.isGuest) return;

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
  }, [isHydrated, user, syncData]);

  // Supabase Realtime channel subscription for instant cross-device updates
  useEffect(() => {
    if (!isHydrated || !user || user.isGuest) return;

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
          {
            event: '*',
            schema: 'public',
            table: 'adventure_destinations',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            syncData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_preferences',
            filter: `user_id=eq.${user.id}`,
          },
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
  }, [isHydrated, user, syncData]);

  return { syncData };
}
