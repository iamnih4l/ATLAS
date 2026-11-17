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
      .from('wishlist_items')
      .select('*, location:locations(*), category:categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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
      category_id,
      priority,
      status,
      tags,
      estimated_budget,
      notes,
      source,
      reference_image_url,
      location_id,
      location,
      is_completed,
    } = body;

    const resolvedLocationId = await resolveLocationId(supabase, location, location_id);
    const resolvedCatId = await resolveCategoryId(supabase, category_id);

    // Synchronize status and is_completed
    let itemStatus = status || 'dreaming';
    let completedFlag = is_completed || false;
    if (itemStatus === 'visited') {
      completedFlag = true;
    } else if (completedFlag) {
      itemStatus = 'visited';
    }

    const insertPayload: any = {
      user_id: user.id,
      title: title || 'Untitled Wishlist Destination',
      description: description || null,
      category_id: resolvedCatId,
      priority: priority || 'medium',
      status: itemStatus,
      tags: Array.isArray(tags) ? tags : [],
      estimated_budget: estimated_budget ? Number(estimated_budget) : null,
      notes: notes || null,
      source: source || 'Personal Bucket List',
      reference_image_url: reference_image_url || null,
      location_id: resolvedLocationId,
      is_completed: completedFlag,
    };

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert(insertPayload)
      .select('*, location:locations(*), category:categories(*)')
      .single();

    if (error) {
      // Fallback: If migration for 'status' column hasn't run yet in external Supabase, retry without status/tags
      if (error.message.includes('column "status"') || error.message.includes('column "tags"')) {
        delete insertPayload.status;
        delete insertPayload.tags;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('wishlist_items')
          .insert(insertPayload)
          .select('*, location:locations(*), category:categories(*)')
          .single();

        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }
        return NextResponse.json({ ...fallbackData, status: itemStatus, tags: [] }, { status: 201 });
      }

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
      return NextResponse.json({ error: 'Wishlist Item ID required.' }, { status: 400 });
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

    if (payload.status === 'visited') {
      payload.is_completed = true;
    } else if (payload.is_completed === true && !payload.status) {
      payload.status = 'visited';
    } else if (payload.status === 'dreaming') {
      payload.is_completed = false;
    }

    delete payload.location;
    delete payload.category;

    const { data, error } = await supabase
      .from('wishlist_items')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, location:locations(*), category:categories(*)')
      .single();

    if (error) {
      // Graceful fallback if status/tags column not yet present
      if (error.message.includes('column "status"') || error.message.includes('column "tags"')) {
        delete payload.status;
        delete payload.tags;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('wishlist_items')
          .update(payload)
          .eq('id', id)
          .eq('user_id', user.id)
          .select('*, location:locations(*), category:categories(*)')
          .single();

        if (fallbackError) {
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }
        return NextResponse.json(fallbackData);
      }

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
      .from('wishlist_items')
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
