import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: experiences } = await supabase
      .from('experiences')
      .select('*, location:locations(*), category:categories(*)')
      .eq('user_id', user.id);

    const { count: wishlistCount } = await supabase
      .from('wishlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const list = experiences || [];
    const countries = Array.from(new Set(list.map((e: any) => e.location?.country).filter(Boolean)));
    const cities = Array.from(new Set(list.map((e: any) => e.location?.city).filter(Boolean)));
    const uniqueLocations = Array.from(new Set(list.map((e: any) => e.location_id)));

    const ratings = list.map((e: any) => e.rating).filter((r: any) => r !== null);
    const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

    return NextResponse.json({
      totalExperiences: list.length,
      countriesVisited: countries.length,
      citiesExplored: cities.length,
      uniqueLocations: uniqueLocations.length,
      averageRating: avgRating,
      wishlistCount: wishlistCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
