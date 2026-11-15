/**
 * Canonical Site URL and Auth Redirect Resolver for ATLAS
 * 
 * Ensures email confirmation and OAuth links always redirect to the public,
 * accessible production ATLAS domain rather than an internal Vercel preview
 * URL protected by Vercel Authentication / Deployment Protection.
 */

export const PRODUCTION_DOMAIN = 'https://atlas-app-ruby-six.vercel.app';

export function getSiteUrl(): string {
  // 1. Explicit environment variable set by deployment or user
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Client-side browser window
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    // If developing locally, respect local host
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }

    // If the origin is a Vercel preview domain (contains -git- or hash),
    // preview deployments have Vercel Authentication (Deployment Protection) enabled.
    // Always map to the public production domain so email links are publicly accessible.
    if (origin.includes('.vercel.app') && !origin.includes('atlas-app-ruby-six.vercel.app')) {
      return PRODUCTION_DOMAIN;
    }

    return origin;
  }

  // 3. Fallback to production domain
  return PRODUCTION_DOMAIN;
}

export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
