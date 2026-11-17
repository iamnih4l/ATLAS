import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveLocationId(supabase: any, location: any, location_id?: string | null): Promise<string | null> {
  if (location_id && UUID_REGEX.test(location_id)) {
    return location_id;
  }

  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    if (location.place_id) {
      const { data: existingByPlace } = await supabase
        .from('locations')
        .select('id')
        .eq('place_id', location.place_id)
        .maybeSingle();

      if (existingByPlace?.id) {
        return existingByPlace.id;
      }
    }

    const { data: existingByCoords } = await supabase
      .from('locations')
      .select('id')
      .gte('latitude', location.latitude - 0.0002)
      .lte('latitude', location.latitude + 0.0002)
      .gte('longitude', location.longitude - 0.0002)
      .lte('longitude', location.longitude + 0.0002)
      .maybeSingle();

    if (existingByCoords?.id) {
      return existingByCoords.id;
    }

    const { data: newLoc, error: locErr } = await supabase
      .from('locations')
      .insert({
        name: location.name || 'Selected Point on Earth',
        city: location.city || null,
        country: location.country || 'Earth',
        venue: location.venue || null,
        latitude: location.latitude,
        longitude: location.longitude,
        place_id: location.place_id || null,
      })
      .select('id')
      .single();

    if (!locErr && newLoc?.id) {
      return newLoc.id;
    }
  }

  return null;
}

async function resolveCategoryId(supabase: any, category_id?: string | null): Promise<string | null> {
  if (!category_id) return null;
  if (UUID_REGEX.test(category_id)) return category_id;

  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .or(`slug.eq.${category_id},name.eq.${category_id}`)
    .maybeSingle();

  return cat?.id || null;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Experiences
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (expError) throw expError;

    // 2. Fetch Wishlist Items
    const { data: wishlistItems, error: wishError } = await supabase
      .from('wishlist_items')
      .select('*, location:locations(*), category:categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (wishError) throw wishError;

    // 3. Fetch Adventures
    const { data: adventures, error: advError } = await supabase
      .from('adventures')
      .select('*, destinations:adventure_destinations(*, location:locations(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (advError) throw advError;

    // 4. Collect all referenced locations
    const locationsMap = new Map<string, any>();
    (experiences || []).forEach((e: any) => {
      if (e.location) locationsMap.set(e.location.id, e.location);
    });
    (wishlistItems || []).forEach((w: any) => {
      if (w.location) locationsMap.set(w.location.id, w.location);
    });
    (adventures || []).forEach((a: any) => {
      (a.destinations || []).forEach((d: any) => {
        if (d.location) locationsMap.set(d.location.id, d.location);
      });
    });

    return NextResponse.json({
      success: true,
      experiences: experiences || [],
      wishlistItems: (wishlistItems || []).map((w: any) => ({
        ...w,
        status: w.status || (w.is_completed ? 'visited' : 'dreaming'),
      })),
      adventures: adventures || [],
      locations: Array.from(locationsMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { localExperiences = [], localWishlistItems = [], localAdventures = [] } = body;

    // Existing records in database to prevent duplicates
    const { data: existingExperiences } = await supabase
      .from('experiences')
      .select('id, title, date, location_id')
      .eq('user_id', user.id);

    const { data: existingWishlist } = await supabase
      .from('wishlist_items')
      .select('id, title, location_id')
      .eq('user_id', user.id);

    // 1. Migrate Local Experiences
    for (const exp of localExperiences) {
      // If it's a temporary client ID or unsynced record
      const isLocalOnly = !exp.id || !UUID_REGEX.test(exp.id) || exp.user_id !== user.id;
      if (!isLocalOnly) continue;

      // Duplicate check: Same title and date
      const isDuplicate = existingExperiences?.some(
        (e) => e.title.trim().toLowerCase() === (exp.title || '').trim().toLowerCase() && e.date === exp.date
      );

      if (!isDuplicate) {
        const locId = await resolveLocationId(supabase, exp.location, exp.location_id);
        if (locId) {
          const catId = await resolveCategoryId(supabase, exp.category_id);
          await supabase.from('experiences').insert({
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
        }
      }
    }

    // 2. Migrate Local Wishlist Items
    for (const item of localWishlistItems) {
      const isLocalOnly = !item.id || !UUID_REGEX.test(item.id) || item.user_id !== user.id;
      if (!isLocalOnly) continue;

      const isDuplicate = existingWishlist?.some(
        (w) => w.title.trim().toLowerCase() === (item.title || '').trim().toLowerCase()
      );

      if (!isDuplicate) {
        const locId = await resolveLocationId(supabase, item.location, item.location_id);
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
        if (insErr && (insErr.message.includes('column "status"') || insErr.message.includes('column "tags"'))) {
          delete insertPayload.status;
          delete insertPayload.tags;
          await supabase.from('wishlist_items').insert(insertPayload);
        }
      }
    }

    // 3. Return fresh unified server state
    const { data: experiences } = await supabase
      .from('experiences')
      .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    const { data: wishlistItems } = await supabase
      .from('wishlist_items')
      .select('*, location:locations(*), category:categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: adventures } = await supabase
      .from('adventures')
      .select('*, destinations:adventure_destinations(*, location:locations(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const locationsMap = new Map<string, any>();
    (experiences || []).forEach((e: any) => {
      if (e.location) locationsMap.set(e.location.id, e.location);
    });
    (wishlistItems || []).forEach((w: any) => {
      if (w.location) locationsMap.set(w.location.id, w.location);
    });

    return NextResponse.json({
      success: true,
      migrated: true,
      experiences: experiences || [],
      wishlistItems: (wishlistItems || []).map((w: any) => ({
        ...w,
        status: w.status || (w.is_completed ? 'visited' : 'dreaming'),
      })),
      adventures: adventures || [],
      locations: Array.from(locationsMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
