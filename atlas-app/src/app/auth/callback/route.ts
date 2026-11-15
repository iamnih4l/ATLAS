import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/auth/verified';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle explicit errors passed from Supabase verify redirect
  if (errorParam) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam || 'Verification failed');
    return NextResponse.redirect(`${origin}/auth/verified?error=${errorMsg}`);
  }

  // 1. PKCE Code exchange
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Clear any guest cookie since user is now verified
        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.delete('atlas_guest_mode');
        return response;
      }
      console.error('Code exchange error:', error);
      return NextResponse.redirect(
        `${origin}/auth/verified?error=${encodeURIComponent(error.message)}`
      );
    } catch (e: any) {
      console.error('Unexpected error in code exchange:', e);
      return NextResponse.redirect(
        `${origin}/auth/verified?error=${encodeURIComponent('Could not exchange verification code')}`
      );
    }
  }

  // 2. Token hash OTP verification (Email signup/recovery/magic link)
  if (token_hash && type) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });
      if (!error) {
        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.delete('atlas_guest_mode');
        return response;
      }
      console.error('Verify OTP error:', error);
      return NextResponse.redirect(
        `${origin}/auth/verified?error=${encodeURIComponent(error.message)}`
      );
    } catch (e: any) {
      console.error('Unexpected error in verifyOtp:', e);
      return NextResponse.redirect(
        `${origin}/auth/verified?error=${encodeURIComponent('Verification link is invalid or expired')}`
      );
    }
  }

  // Fallback: If neither code nor token_hash was provided, redirect to verified page
  return NextResponse.redirect(`${origin}/auth/verified`);
}
