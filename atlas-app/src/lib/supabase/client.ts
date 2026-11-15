import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || url.includes('your_supabase') || !url.startsWith('http')) {
    browserClient = createBrowserClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    );
  } else {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}
