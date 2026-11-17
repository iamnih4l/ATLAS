import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  UUID_REGEX,
  isValidUuid,
  normalizeDbAdventure,
  persistAdventureToSupabase,
  resolveOrCreateLocationId,
} from '@/lib/adventure-db';
import { Adventure, AdventureDestination } from '@/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

async function resolveCategoryId(supabase: any, category_id?: string | null): Promise<string | null> {
  if (!category_id) return null;
  if (UUID_REGEX.test(category_id)) return category_id;

  const { data: defaultCats } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_default', true);

  if (defaultCats && defaultCats.length > 0) {
    const idx = parseInt(category_id, 10) - 1;
    if (!isNaN(idx) && defaultCats[idx]) {
      return defaultCats[idx].id;
    }
    const lowerCat = category_id.toLowerCase();
    const matched = defaultCats.find(
      (c: any) =>
        c.slug === lowerCat ||
        c.name.toLowerCase() === lowerCat
    );
    if (matched) return matched.id;
    return defaultCats[0].id;
  }
  return null;
}

async function fetchUnifiedUserState(supabase: any, userId: string) {
  // 1. Fetch Experiences
  const { data: experiences, error: expError } = await supabase
    .from('experiences')
    .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (expError) {
    console.warn('Sync GET experiences warning:', expError.message);
  }

  // 2. Fetch Wishlist Items
  const { data: wishlistItems, error: wishError } = await supabase
    .from('wishlist_items')
    .select('*, location:locations(*), category:categories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (wishError) {
    console.warn('Sync GET wishlist_items warning:', wishError.message);
  }

  // 3. Fetch Adventures (graceful if table doesn't exist yet)
  const { data: rawAdventures, error: advError } = await supabase
    .from('adventures')
    .select('*, destinations:adventure_destinations(*, location:locations(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (advError) {
    console.warn('Sync GET adventures warning:', advError.message);
  }

  const normalizedAdventures: Adventure[] = (rawAdventures || []).map(normalizeDbAdventure);

  // 4. Collect all referenced locations
  const locationsMap = new Map<string, any>();
  (experiences || []).forEach((e: any) => {
    if (e.location) locationsMap.set(e.location.id, e.location);
  });
  (wishlistItems || []).forEach((w: any) => {
    if (w.location) locationsMap.set(w.location.id, w.location);
  });
  normalizedAdventures.forEach((a: Adventure) => {
    (a.destinations || []).forEach((d: AdventureDestination) => {
      if (d.location) locationsMap.set(d.location.id, d.location);
    });
  });

  // 5. Fetch Preferences & Profile
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, email, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  return {
    experiences: experiences || [],
    wishlistItems: (wishlistItems || []).map((w: any) => ({
      ...w,
      status: w.status || (w.is_completed ? 'visited' : 'dreaming'),
    })),
    adventures: normalizedAdventures,
    locations: Array.from(locationsMap.values()),
    preferences: preferences || null,
    profile: profile
      ? {
          fullName: profile.full_name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
        }
      : null,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unified = await fetchUnifiedUserState(supabase, user.id);

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        ...unified,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      localExperiences = [],
      localWishlistItems = [],
      localAdventures = [],
      localLocations = [],
    } = body;

    // Fetch existing database records to prevent duplicates
    const { data: existingExperiences } = await supabase
      .from('experiences')
      .select('id, title, date, location_id')
      .eq('user_id', user.id);

    const { data: existingWishlist } = await supabase
      .from('wishlist_items')
      .select('id, title, location_id')
      .eq('user_id', user.id);

    const { data: existingAdventures } = await supabase
      .from('adventures')
      .select('id, title')
      .eq('user_id', user.id);

    // 1. Migrate Local Experiences
    for (const exp of localExperiences) {
      const isLocalOnly = !isValidUuid(exp.id) || exp.user_id !== user.id;
      if (!isLocalOnly) continue;

      const isDuplicate = existingExperiences?.some(
        (e: any) =>
          e.title.trim().toLowerCase() === (exp.title || '').trim().toLowerCase() &&
          e.date === exp.date
      );

      if (!isDuplicate) {
        const locId = await resolveOrCreateLocationId(
          supabase,
          exp.location,
          exp.location_id,
          localLocations
        );
        if (locId) {
          const catId = await resolveCategoryId(supabase, exp.category_id);
          const { error: expInsErr } = await supabase.from('experiences').insert({
            user_id: user.id,
            location_id: locId,
            title: exp.title || 'Untitled Experience',
            description: exp.description || null,
            date: exp.date || new Date().toISOString().split('T')[0],
            rating: exp.rating || null,
            category_id: catId,
            privacy: exp.privacy || 'private',
            notes: exp.notes || null,
            cover_image_url: exp.cover_image_url || null,
          });
          if (expInsErr) {
            console.warn('Sync migrate experience error:', expInsErr.message);
          }
        }
      }
    }

    // 2. Migrate Local Wishlist Items
    for (const item of localWishlistItems) {
      const isLocalOnly = !isValidUuid(item.id) || item.user_id !== user.id;
      if (!isLocalOnly) continue;

      const isDuplicate = existingWishlist?.some(
        (w: any) => w.title.trim().toLowerCase() === (item.title || '').trim().toLowerCase()
      );

      if (!isDuplicate) {
        const locId = await resolveOrCreateLocationId(
          supabase,
          item.location,
          item.location_id,
          localLocations
        );
        const catId = await resolveCategoryId(supabase, item.category_id);
        const itemStatus = item.status || (item.is_completed ? 'visited' : 'dreaming');

        const insertPayload: any = {
          user_id: user.id,
          title: item.title || 'Untitled Wishlist Item',
          description: item.description || null,
          category_id: catId,
          priority: item.priority || 'medium',
          status: itemStatus,
          tags: Array.isArray(item.tags) ? item.tags : [],
          estimated_budget: item.estimated_budget ? Number(item.estimated_budget) : null,
          notes: item.notes || null,
          source: item.source || 'Local Mobile Migration',
          reference_image_url: item.reference_image_url || null,
          location_id: locId,
          is_completed: item.is_completed || false,
        };

        const { error: insErr } = await supabase.from('wishlist_items').insert(insertPayload);
        if (
          insErr &&
          (insErr.message.includes('column "status"') || insErr.message.includes('column "tags"'))
        ) {
          delete insertPayload.status;
          delete insertPayload.tags;
          await supabase.from('wishlist_items').insert(insertPayload);
        } else if (insErr) {
          console.warn('Sync migrate wishlist error:', insErr.message);
        }
      }
    }

    // 3. Migrate Local Adventures ("Pinned Plans")
    for (const adv of localAdventures) {
      const isLocalOnly = !isValidUuid(adv.id) || adv.user_id !== user.id;
      if (!isLocalOnly) continue;

      const isDuplicate = existingAdventures?.some(
        (a: any) => a.title.trim().toLowerCase() === (adv.title || '').trim().toLowerCase()
      );

      if (!isDuplicate) {
        await persistAdventureToSupabase(
          supabase,
          user.id,
          adv,
          Array.isArray(adv.destinations) ? adv.destinations : []
        );
      }
    }

    // 4. Return fresh unified server state
    const unified = await fetchUnifiedUserState(supabase, user.id);

    return NextResponse.json(
      {
        success: true,
        migrated: true,
        userId: user.id,
        ...unified,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
