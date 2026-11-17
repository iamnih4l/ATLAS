import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UUID_REGEX, resolveOrCreateLocationId } from '@/lib/adventure-db';

export const dynamic = 'force-dynamic';

async function resolveLocationId(supabase: any, location: any, location_id?: string | null): Promise<string | null> {
  return resolveOrCreateLocationId(supabase, location, location_id);
}

async function resolveCategoryId(supabase: any, category_id?: string | null): Promise<string | null> {
  if (!category_id) return null;
  if (UUID_REGEX.test(category_id)) return category_id;

  // Try matching by slug or name if a slug or numeric ID was passed
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

    const { data, error } = await supabase
      .from('experiences')
      .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
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
    const {
      title,
      description,
      date,
      rating,
      category_id,
      location_id,
      location,
      privacy,
      notes,
      cover_image_url,
    } = body;

    const resolvedLocationId = await resolveLocationId(supabase, location, location_id);

    if (!resolvedLocationId) {
      return NextResponse.json({ error: 'Valid location coordinates are required.' }, { status: 400 });
    }

    const resolvedCatId = await resolveCategoryId(supabase, category_id);

    const { data, error } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        location_id: resolvedLocationId,
        title: title || 'Untitled Memory',
        description: description || null,
        date: date || new Date().toISOString().split('T')[0],
        rating: rating !== undefined && rating !== null ? rating : null,
        category_id: resolvedCatId,
        privacy: privacy || 'private',
        notes: notes || null,
        cover_image_url: cover_image_url || null,
      })
      .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates, location } = body;

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required.' }, { status: 400 });
    }

    const payload: any = { ...updates, updated_at: new Date().toISOString() };

    if (location) {
      const locId = await resolveLocationId(supabase, location, updates?.location_id);
      if (locId) {
        payload.location_id = locId;
      }
    } else if (payload.location_id && !UUID_REGEX.test(payload.location_id)) {
      delete payload.location_id;
    }

    if (payload.category_id !== undefined) {
      payload.category_id = await resolveCategoryId(supabase, payload.category_id);
    }

    // Delete nested object references that are not database columns
    delete payload.location;
    delete payload.category;
    delete payload.media;

    const { data, error } = await supabase
      .from('experiences')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, location:locations(*), category:categories(*), media:experience_media(*)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
