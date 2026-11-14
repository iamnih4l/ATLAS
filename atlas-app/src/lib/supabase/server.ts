import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = url && url.startsWith('http') && !url.includes('your_supabase')
    ? url
    : 'https://placeholder-project.supabase.co';
  const validKey = key || 'placeholder-anon-key';

  return createServerClient(validUrl, validKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handled in middleware
        }
      },
    },
  });
}
