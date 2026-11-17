import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        preferences: null,
        profile: null,
      });
    }

    // 1. Fetch user_preferences
    let { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (prefError && prefError.code !== 'PGRST116') {
      console.warn('Error fetching user_preferences:', prefError.message);
    }

    // If no row exists, create initial row
    if (!preferences) {
      const { data: newPrefs, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          ai_personalization: true,
          location_permission: false,
          default_privacy: 'private',
        })
        .select('*')
        .single();

      if (!insertError && newPrefs) {
        preferences = newPrefs;
      }
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const fullName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Atlas Explorer';

    return NextResponse.json({
      authenticated: true,
      preferences: preferences || {
        user_id: user.id,
        ai_personalization: true,
        location_permission: false,
        default_privacy: 'private',
      },
      profile: {
        fullName,
        email: user.email,
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      },
    });
  } catch (err: any) {
    console.error('API /api/preferences GET error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch preferences' },
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
    const {
      fullName,
      defaultPrivacy = 'private',
      aiPersonalization = true,
      allowLocation = false,
      favoriteCategories = [],
      interests = [],
      travelBudget = 'moderate',
    } = body;

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        savedLocally: true,
        preferences: {
          default_privacy: defaultPrivacy,
          ai_personalization: aiPersonalization,
          location_permission: allowLocation,
          favorite_categories: favoriteCategories,
          interests,
          travel_budget: travelBudget,
        },
        profile: {
          fullName: fullName || 'Atlas Explorer',
        },
      });
    }

    // 1. Upsert user_preferences
    const prefPayload = {
      user_id: user.id,
      default_privacy: defaultPrivacy,
      ai_personalization: Boolean(aiPersonalization),
      location_permission: Boolean(allowLocation),
      favorite_categories: favoriteCategories,
      interests,
      travel_budget: travelBudget,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPrefs, error: prefError } = await supabase
      .from('user_preferences')
      .upsert(prefPayload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (prefError) {
      console.warn('Error saving user_preferences:', prefError.message);
    }

    // 2. Upsert profile if fullName provided
    let updatedFullName = fullName;
    if (fullName && fullName.trim()) {
      const cleanName = fullName.trim();
      updatedFullName = cleanName;

      await supabase.from('user_profiles').upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: cleanName,
        },
        { onConflict: 'id' }
      );

      // Also update auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: { full_name: cleanName },
        });
      } catch (authErr) {
        console.warn('Failed to update auth metadata:', authErr);
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      preferences: updatedPrefs || prefPayload,
      profile: {
        fullName: updatedFullName,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error('API /api/preferences POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
