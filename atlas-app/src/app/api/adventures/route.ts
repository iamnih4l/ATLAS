import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  isValidUuid,
  normalizeDbAdventure,
  persistAdventureToSupabase,
} from '@/lib/adventure-db';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        adventures: [],
        authenticated: false,
      });
    }

    const { data: adventures, error } = await supabase
      .from('adventures')
      .select(`
        *,
        destinations:adventure_destinations(*, location:locations(*))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching adventures from Supabase:', error.message);
      return NextResponse.json({
        adventures: [],
        authenticated: true,
        error: error.message,
      });
    }

    const normalizedAdventures = (adventures || []).map(normalizeDbAdventure);

    return NextResponse.json({
      adventures: normalizedAdventures,
      authenticated: true,
    });
  } catch (err: any) {
    console.error('API /api/adventures GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch adventures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { adventure, destinations = [] } = body;

    if (!adventure || !adventure.title) {
      return NextResponse.json(
        { error: 'Adventure title is required' },
        { status: 400 }
      );
    }

    if (user) {
      const { adventure: savedAdventure, error } = await persistAdventureToSupabase(
        supabase,
        user.id,
        adventure,
        destinations
      );

      if (savedAdventure) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          adventure: savedAdventure,
        });
      }

      console.warn('API /api/adventures POST fell back after error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error || 'Failed to persist adventure to Supabase',
          adventure,
        },
        { status: 200 }
      );
    }

    // Guest / unauthenticated fallback
    return NextResponse.json({
      success: true,
      authenticated: false,
      adventure: {
        ...adventure,
        destinations,
      },
    });
  } catch (err: any) {
    console.error('API /api/adventures POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save adventure' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Adventure ID required' }, { status: 400 });
    }

    if (user && isValidUuid(id)) {
      // Map frontend fields to valid DB columns
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.cover_image_url !== undefined) dbUpdates.cover_image_url = updates.cover_image_url;
      if (updates.target_start_date !== undefined) dbUpdates.start_date = updates.target_start_date;
      if (updates.target_end_date !== undefined) dbUpdates.end_date = updates.target_end_date;

      const { error } = await supabase
        .from('adventures')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Supabase update adventure error:', error.message);
      }
    }

    return NextResponse.json({ success: true, id, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Adventure ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && isValidUuid(id)) {
      await supabase.from('adventure_destinations').delete().eq('adventure_id', id);
      await supabase.from('adventures').delete().eq('id', id).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
