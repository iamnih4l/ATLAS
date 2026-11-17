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
 * Trigger an immediate sync from any component without mounting duplicate Realtime channels.
 */
export function triggerAtlasSync(forceMigration = true): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  return new Promise((resolve) => {
    const requestId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timeout = setTimeout(() => {
      window.removeEventListener('atlas:sync-done', onDone as EventListener);
      resolve(true);
    }, 8000);

    const onDone = (e: CustomEvent) => {
      if (e.detail?.requestId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener('atlas:sync-done', onDone as EventListener);
        resolve(Boolean(e.detail?.ok));
      }
    };

    window.addEventListener('atlas:sync-done', onDone as EventListener);
    window.dispatchEvent(
      new CustomEvent('atlas:sync-now', {
        detail: { forceMigration, requestId },
      })
    );
  });
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
    if (serverIds.has(local.id)) continue;

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
    async (forceMigration = false): Promise<boolean> => {
      if (!user || user.isGuest || isSyncingRef.current) return false;
      if (!useAtlasStore.persist.hasHydrated()) return false;

      try {
        isSyncingRef.current = true;

        const current = useAtlasStore.getState();

        saveSafetyBackup({
          experiences: current.experiences,
          wishlistItems: current.wishlistItems,
          adventures: current.adventures,
          locations: current.locations,
        });

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
          ? await fetch(`/api/sync?t=${Date.now()}`, {
              method: 'POST',
              cache: 'no-store',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
              },
              body: JSON.stringify({
                localExperiences: current.experiences,
                localWishlistItems: current.wishlistItems,
                localAdventures: current.adventures,
                localLocations: current.locations,
              }),
            })
          : await fetch(`/api/sync?t=${Date.now()}`, {
              method: 'GET',
              cache: 'no-store',
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
              },
            });

        if (!res.ok) return false;

        const data = await res.json();
        if (!data.success) return false;

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

        return true;
      } catch (err) {
        console.warn('Atlas data synchronization warning:', err);
        return false;
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

  // Listen to manual sync requests from anywhere in the app (e.g. MobileBottomNav "Sync Now")
  useEffect(() => {
    if (!isHydrated || !user || user.isGuest) return;

    const handleSyncNow = async (e: Event) => {
      const custom = e as CustomEvent;
      const ok = await syncData(Boolean(custom.detail?.forceMigration));
      if (custom.detail?.requestId) {
        window.dispatchEvent(
          new CustomEvent('atlas:sync-done', {
            detail: { requestId: custom.detail.requestId, ok },
          })
        );
      }
    };

    window.addEventListener('atlas:sync-now', handleSyncNow);
    return () => {
      window.removeEventListener('atlas:sync-now', handleSyncNow);
    };
  }, [isHydrated, user, syncData]);

  // Window focus, online reconnect, and 15-second active-tab polling fallback
  // (Ensures desktop -> mobile updates arrive even if Supabase Realtime publication isn't enabled yet)
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

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncData();
      }
    }, 15000);

    window.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
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
