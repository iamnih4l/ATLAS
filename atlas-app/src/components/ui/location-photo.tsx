'use client';

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATIC_PLACEHOLDER_PATTERNS = [
  'photo-1507525428034-b723cf961d3e', // Generic beach placeholder
  'photo-1506744038136-46273834b3fb', // Generic Yosemite valley placeholder
  'photo-1469854523086-cc02fe5d8800', // Generic road trip placeholder
];

/**
 * Returns true if the URL is null/empty or one of ATLAS's legacy hardcoded static placeholders.
 */
export function isStaticPlaceholderImage(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return STATIC_PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

// Client-side memory cache & in-flight deduplication (zero disk/DB storage!)
const resolvedPhotoCache = new Map<string, string | null>();
const inFlightRequests = new Map<string, Promise<string | null>>();

function buildCacheKey(params: {
  name?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const latKey =
    typeof params.latitude === 'number' && Number.isFinite(params.latitude)
      ? params.latitude.toFixed(2)
      : '';
  const lngKey =
    typeof params.longitude === 'number' && Number.isFinite(params.longitude)
      ? params.longitude.toFixed(2)
      : '';
  return `${(params.name || '').trim().toLowerCase()}|${(params.city || '').trim().toLowerCase()}|${(params.country || '').trim().toLowerCase()}|${latKey}|${lngKey}`;
}

async function fetchLocationPhotoUrl(params: {
  name?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<string | null> {
  const key = buildCacheKey(params);
  if (resolvedPhotoCache.has(key)) {
    return resolvedPhotoCache.get(key) ?? null;
  }

  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) return existingPromise;

  const query = new URLSearchParams();
  if (params.name) query.set('name', params.name);
  if (params.city) query.set('city', params.city);
  if (params.country) query.set('country', params.country);
  if (typeof params.latitude === 'number' && Number.isFinite(params.latitude)) {
    query.set('lat', String(params.latitude));
  }
  if (typeof params.longitude === 'number' && Number.isFinite(params.longitude)) {
    query.set('lng', String(params.longitude));
  }

  const reqPromise = fetch(`/api/location-image?${query.toString()}`)
    .then((res) => (res.ok ? res.json() : { imageUrl: null }))
    .then((data) => {
      const url = typeof data?.imageUrl === 'string' && data.imageUrl ? data.imageUrl : null;
      resolvedPhotoCache.set(key, url);
      return url;
    })
    .catch(() => {
      resolvedPhotoCache.set(key, null);
      return null;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, reqPromise);
  return reqPromise;
}

export interface LocationPhotoProps {
  src?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  alt: string;
  className?: string;
}

export function LocationPhoto({
  src,
  name,
  city,
  country,
  latitude,
  longitude,
  alt,
  className,
}: LocationPhotoProps) {
  const hasRealUserPhoto = !isStaticPlaceholderImage(src);
  const cacheKey = buildCacheKey({ name, city, country, latitude, longitude });

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    if (hasRealUserPhoto) return src || null;
    return resolvedPhotoCache.get(cacheKey) ?? null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (hasRealUserPhoto) return false;
    return !resolvedPhotoCache.has(cacheKey);
  });
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);

    if (hasRealUserPhoto && src) {
      setResolvedUrl(src);
      setIsLoading(false);
      return;
    }

    if (resolvedPhotoCache.has(cacheKey)) {
      setResolvedUrl(resolvedPhotoCache.get(cacheKey) ?? null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    fetchLocationPhotoUrl({ name, city, country, latitude, longitude }).then((url) => {
      if (!isCancelled) {
        setResolvedUrl(url);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [src, hasRealUserPhoto, cacheKey, name, city, country, latitude, longitude]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'w-full h-full bg-gradient-to-br from-[#FFF4D9] via-[#FFD45A]/40 to-[#6425F5]/20 animate-pulse flex items-center justify-center',
          className
        )}
      >
        <MapPin className="w-6 h-6 text-[#171313]/30" />
      </div>
    );
  }

  if (!resolvedUrl || hasImgError) {
    return (
      <div
        className={cn(
          'w-full h-full bg-gradient-to-br from-[#6425F5] via-[#326BEE] to-[#171313] flex flex-col items-center justify-center p-4 text-center text-white',
          className
        )}
      >
        <MapPin className="w-7 h-7 text-[#FFD45A] mb-1.5 stroke-[2.5]" />
        <span className="text-xs font-black tracking-tight line-clamp-2 drop-shadow-sm">
          {name || alt}
        </span>
        {(city || country) && (
          <span className="text-[10px] font-bold text-white/80 mt-0.5">
            {[city, country].filter(Boolean).join(', ')}
          </span>
        )}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasImgError(true)}
      className={cn('w-full h-full object-cover', className)}
    />
  );
}
