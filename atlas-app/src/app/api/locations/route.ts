import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

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
    const body = await request.json();
    const { name, city, country, venue, latitude, longitude, place_id } = body;

    // Check if location already exists with exact coordinates
    const { data: existing } = await supabase
      .from('locations')
      .select('*')
      .eq('latitude', latitude)
      .eq('longitude', longitude)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(existing);
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        name,
        city,
        country,
        venue,
        latitude,
        longitude,
        place_id,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
