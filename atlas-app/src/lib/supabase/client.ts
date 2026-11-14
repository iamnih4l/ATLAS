import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your_supabase') || !url.startsWith('http')) {
    // Return dummy client or mock for offline mode
    return createBrowserClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    );
  }

  return createBrowserClient(url, key);
}
