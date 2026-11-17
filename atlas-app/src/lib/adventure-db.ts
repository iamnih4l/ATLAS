import { Adventure, AdventureDestination } from '@/types';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(val?: string | null): val is string {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

/**
 * Resolves a location object or location_id into a valid Postgres UUID in the `locations` table.
 */
export async function resolveOrCreateLocationId(
  supabase: any,
  location?: {
    id?: string | null;
    name?: string | null;
    city?: string | null;
    country?: string | null;
    venue?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    place_id?: string | null;
  } | null,
  locationId?: string | null,
  fallbackLocations?: any[]
): Promise<string | null> {
  if (isValidUuid(locationId)) {
    return locationId;
  }

  let loc = location;
  if (!loc && locationId && Array.isArray(fallbackLocations)) {
    loc = fallbackLocations.find((l) => l.id === locationId) || null;
  }

  if (!loc) return null;

  if (isValidUuid(loc.id)) {
    return loc.id;
  }

  const lat = Number(loc.latitude);
  const lng = Number(loc.longitude);
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

  // 1. Try lookup by place_id
  if (loc.place_id) {
    const { data: byPlace } = await supabase
      .from('locations')
      .select('id')
      .eq('place_id', loc.place_id)
      .maybeSingle();
    if (byPlace?.id) return byPlace.id;
  }

  // 2. Try lookup by nearby coordinates
  if (hasValidCoords) {
    const { data: byCoords } = await supabase
      .from('locations')
      .select('id')
      .gte('latitude', lat - 0.0002)
      .lte('latitude', lat + 0.0002)
      .gte('longitude', lng - 0.0002)
      .lte('longitude', lng + 0.0002)
      .maybeSingle();
    if (byCoords?.id) return byCoords.id;
  }

  // 3. Insert new location row
  const { data: newLoc, error } = await supabase
    .from('locations')
    .insert({
      name: loc.name || 'Selected Point on Earth',
      city: loc.city || null,
      country: loc.country || 'Earth',
      venue: loc.venue || null,
      latitude: hasValidCoords ? lat : 0,
      longitude: hasValidCoords ? lng : 0,
      place_id: loc.place_id || null,
    })
    .select('id')
    .single();

  if (error) {
    console.warn('resolveOrCreateLocationId insert error:', error.message);
    return null;
  }

  return newLoc?.id || null;
}

/**
 * Maps a raw Supabase `adventures` row (with joined `adventure_destinations` & `locations`)
 * into the frontend `Adventure` interface seamlessly across 00003 & enhanced schemas.
 */
export function normalizeDbAdventure(row: any): Adventure {
  const rawDests = Array.isArray(row.destinations) ? row.destinations : [];
  const destinations: AdventureDestination[] = rawDests
    .map((d: any, idx: number) => {
      const loc = d.location || null;
      return {
        id: d.id,
        adventure_id: d.adventure_id || row.id,
        location_id: d.location_id || loc?.id || null,
        name: d.name || d.activity_title || loc?.name || `Stop ${idx + 1}`,
        city: d.city ?? loc?.city ?? null,
        country: d.country || loc?.country || 'Earth',
        latitude: Number(d.latitude ?? loc?.latitude ?? 0),
        longitude: Number(d.longitude ?? loc?.longitude ?? 0),
        order_index: d.order_index ?? d.stop_order ?? idx,
        day_number: d.day_number ?? null,
        target_date: d.target_date ?? null,
        notes: d.notes ?? d.activity_description ?? null,
        activities: Array.isArray(d.activities) ? d.activities : [],
        is_completed: Boolean(d.is_completed),
        completed_experience_id: d.completed_experience_id ?? null,
        created_at: d.created_at,
        updated_at: d.updated_at,
        location: loc || undefined,
      };
    })
    .sort((a: AdventureDestination, b: AdventureDestination) => a.order_index - b.order_index);

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description ?? null,
    status: row.status || 'planned',
    target_start_date: row.target_start_date ?? row.start_date ?? null,
    target_end_date: row.target_end_date ?? row.end_date ?? null,
    estimated_budget: row.estimated_budget ?? null,
    currency: row.currency || 'USD',
    notes: row.notes ?? null,
    cover_image_url: row.cover_image_url ?? null,
    is_bucket_list: row.is_bucket_list ?? row.status === 'dreaming',
    conversation_id: row.conversation_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    destinations,
  };
}

/**
 * Inserts or updates an Adventure and its destinations into Supabase using strict UUIDs
 * and schema-compatible columns (works out of the box on migration 00003 and 00005).
 */
export async function persistAdventureToSupabase(
  supabase: any,
  userId: string,
  adventure: Partial<Adventure>,
  destinations: Partial<AdventureDestination>[] = []
): Promise<{ adventure: Adventure | null; error?: string }> {
  const validStatusList = ['dreaming', 'planned', 'upcoming', 'in_progress', 'completed', 'archived'];
  const safeStatus = validStatusList.includes(adventure.status || '') ? adventure.status! : 'planned';

  const basePayload: Record<string, any> = {
    user_id: userId,
    title: adventure.title || 'Untitled Adventure',
    description: adventure.description || null,
    notes: adventure.notes || null,
    cover_image_url: adventure.cover_image_url || null,
    start_date: adventure.target_start_date || null,
    end_date: adventure.target_end_date || null,
    status: safeStatus,
    updated_at: new Date().toISOString(),
  };

  if (isValidUuid(adventure.id)) {
    basePayload.id = adventure.id;
  }

  let savedAdvRow: any = null;
  let advErr: any = null;

  if (basePayload.id) {
    const res = await supabase
      .from('adventures')
      .upsert(basePayload, { onConflict: 'id' })
      .select('*')
      .single();
    savedAdvRow = res.data;
    advErr = res.error;
  } else {
    const res = await supabase
      .from('adventures')
      .insert(basePayload)
      .select('*')
      .single();
    savedAdvRow = res.data;
    advErr = res.error;
  }

  if (advErr || !savedAdvRow) {
    console.warn('persistAdventureToSupabase adventure error:', advErr?.message);
    return { adventure: null, error: advErr?.message || 'Failed to save adventure' };
  }

  const savedDestinations: AdventureDestination[] = [];

  if (Array.isArray(destinations) && destinations.length > 0) {
    for (let idx = 0; idx < destinations.length; idx++) {
      const d = destinations[idx];
      const locId = await resolveOrCreateLocationId(
        supabase,
        {
          id: d.location_id || d.location?.id,
          name: d.name || d.location?.name || `Stop ${idx + 1}`,
          city: d.city || d.location?.city || null,
          country: d.country || d.location?.country || 'Earth',
          latitude: d.latitude ?? d.location?.latitude ?? 0,
          longitude: d.longitude ?? d.location?.longitude ?? 0,
          place_id: d.location?.place_id || null,
        },
        d.location_id
      );

      if (!locId) continue;

      const destPayload: Record<string, any> = {
        adventure_id: savedAdvRow.id,
        user_id: userId,
        location_id: locId,
        stop_order: d.order_index ?? idx,
        day_number: d.day_number ?? idx + 1,
        activity_title: d.name || `Stop ${idx + 1}`,
        activity_description:
          d.notes ||
          (Array.isArray(d.activities) && d.activities.length > 0
            ? d.activities.join(', ')
            : null),
        target_date: d.target_date || null,
        is_completed: Boolean(d.is_completed),
        completed_experience_id: isValidUuid(d.completed_experience_id)
          ? d.completed_experience_id
          : null,
        updated_at: new Date().toISOString(),
      };

      if (isValidUuid(d.id)) {
        destPayload.id = d.id;
      }

      const destRes = destPayload.id
        ? await supabase
            .from('adventure_destinations')
            .upsert(destPayload, { onConflict: 'id' })
            .select('*, location:locations(*)')
            .single()
        : await supabase
            .from('adventure_destinations')
            .insert(destPayload)
            .select('*, location:locations(*)')
            .single();

      if (!destRes.error && destRes.data) {
        const row = destRes.data;
        const loc = row.location;
        savedDestinations.push({
          id: row.id,
          adventure_id: savedAdvRow.id,
          location_id: row.location_id,
          name: row.activity_title || d.name || loc?.name || `Stop ${idx + 1}`,
          city: loc?.city ?? d.city ?? null,
          country: loc?.country || d.country || 'Earth',
          latitude: Number(loc?.latitude ?? d.latitude ?? 0),
          longitude: Number(loc?.longitude ?? d.longitude ?? 0),
          order_index: row.stop_order ?? idx,
          day_number: row.day_number,
          target_date: row.target_date,
          notes: row.activity_description,
          activities: Array.isArray(d.activities) ? d.activities : [],
          is_completed: Boolean(row.is_completed),
          completed_experience_id: row.completed_experience_id,
          location: loc || undefined,
        });
      } else if (destRes.error) {
        console.warn('persistAdventureToSupabase destination error:', destRes.error.message);
      }
    }
  }

  const normalized = normalizeDbAdventure({
    ...savedAdvRow,
    estimated_budget: adventure.estimated_budget ?? savedAdvRow.estimated_budget ?? null,
    currency: adventure.currency || savedAdvRow.currency || 'USD',
    is_bucket_list: adventure.is_bucket_list ?? safeStatus === 'dreaming',
    destinations: savedDestinations,
  });

  return { adventure: normalized };
}
