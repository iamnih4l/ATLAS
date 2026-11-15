import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Adventure, AdventureDestination } from '@/types';

export async function GET(request: Request) {
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
        destinations:adventure_destinations(*)
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

    // Sort destinations by order_index for each adventure
    const sortedAdventures = (adventures || []).map((adv: any) => ({
      ...adv,
      destinations: (adv.destinations || []).sort(
        (a: AdventureDestination, b: AdventureDestination) => a.order_index - b.order_index
      ),
    }));

    return NextResponse.json({
      adventures: sortedAdventures,
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

    const userId = user?.id || 'guest-user';
    const adventureId = adventure.id || `adv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const adventurePayload = {
      id: adventureId,
      user_id: userId,
      title: adventure.title,
      description: adventure.description || null,
      status: adventure.status || 'planned',
      target_start_date: adventure.target_start_date || null,
      target_end_date: adventure.target_end_date || null,
      estimated_budget: adventure.estimated_budget || null,
      currency: adventure.currency || 'USD',
      notes: adventure.notes || null,
      cover_image_url: adventure.cover_image_url || null,
      is_bucket_list: adventure.is_bucket_list ?? false,
      conversation_id: adventure.conversation_id || null,
      updated_at: new Date().toISOString(),
    };

    if (user) {
      const { data: savedAdv, error: advError } = await supabase
        .from('adventures')
        .upsert(adventurePayload)
        .select()
        .single();

      if (advError) {
        console.warn('Supabase upsert adventure error:', advError.message);
      }

      if (destinations && destinations.length > 0) {
        const destRows = destinations.map((d: any, idx: number) => ({
          id: d.id || `dest-${Date.now()}-${idx}`,
          adventure_id: adventureId,
          user_id: user.id,
          location_id: d.location_id || null,
          name: d.name,
          city: d.city || null,
          country: d.country || '',
          latitude: Number(d.latitude) || 0,
          longitude: Number(d.longitude) || 0,
          order_index: d.order_index ?? idx,
          day_number: d.day_number ?? null,
          target_date: d.target_date ?? null,
          notes: d.notes ?? null,
          activities: d.activities || [],
          is_completed: d.is_completed ?? false,
          completed_experience_id: d.completed_experience_id || null,
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('adventure_destinations').upsert(destRows);
      }
    }

    const completeAdventure: Adventure = {
      ...adventurePayload,
      created_at: adventure.created_at || new Date().toISOString(),
      destinations: destinations.map((d: any, idx: number) => ({
        ...d,
        id: d.id || `dest-${Date.now()}-${idx}`,
        adventure_id: adventureId,
        order_index: d.order_index ?? idx,
      })),
    };

    return NextResponse.json({
      success: true,
      adventure: completeAdventure,
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

    if (user) {
      const { error } = await supabase
        .from('adventures')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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

    if (user) {
      // First delete linked destinations
      await supabase.from('adventure_destinations').delete().eq('adventure_id', id);
      await supabase.from('adventures').delete().eq('id', id).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
