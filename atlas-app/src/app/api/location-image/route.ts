import { NextResponse } from 'next/server';

const WIKI_HEADERS = {
  'User-Agent': 'ATLAS-Travel-Journal/1.0 (https://atlas.journal; contact@atlas.journal)',
  Accept: 'application/json',
};

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
};

// Filter out low-value Wikimedia assets like maps, flags, icons, or SVGs
function isUsablePhotoUrl(url?: string | null): url is string {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg') || lower.includes('.svg.png')) return false;
  if (lower.includes('flag_of_') || lower.includes('locator_map') || lower.includes('coat_of_arms')) {
    return false;
  }
  return lower.startsWith('http://') || lower.startsWith('https://');
}

async function fetchWikiSummaryImage(title: string): Promise<{ url: string; attribution?: string } | null> {
  const clean = title.trim();
  if (!clean) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean.replace(/\s+/g, '_'))}`,
      { headers: WIKI_HEADERS, signal: AbortSignal.timeout(4500) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.type === 'disambiguation') return null;

    // Prefer crisp ~800-1000px thumbnail over huge multi-MB raw originals for fast mobile loading
    const candidate = data?.thumbnail?.source || data?.originalimage?.source;
    if (isUsablePhotoUrl(candidate)) {
      // Upscale Wikipedia thumb width if it's tiny (e.g. 320px -> 960px)
      const highRes = candidate.replace(/\/\d+px-/, '/960px-');
      return {
        url: highRes,
        attribution: data?.title ? `Wikimedia Commons • ${data.title}` : 'Wikimedia Commons',
      };
    }
  } catch {
    // Non-fatal, continue to next tier
  }
  return null;
}

async function fetchWikiSearchImage(query: string): Promise<{ url: string; attribution?: string } | null> {
  const clean = query.trim();
  if (!clean) return null;
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: clean,
      gsrlimit: '5',
      prop: 'pageimages',
      pithumbsize: '960',
      piprop: 'thumbnail',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
      headers: WIKI_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    // Sort by search index ascending
    pages.sort((a: any, b: any) => (a.index ?? 99) - (b.index ?? 99));

    for (const page of pages as any[]) {
      const thumb = page?.thumbnail?.source;
      if (isUsablePhotoUrl(thumb)) {
        return {
          url: thumb,
          attribution: page?.title ? `Wikimedia Commons • ${page.title}` : 'Wikimedia Commons',
        };
      }
    }
  } catch {
    // Non-fatal
  }
  return null;
}

async function fetchWikiGeosearchImage(
  lat: number,
  lng: number
): Promise<{ url: string; attribution?: string } | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'geosearch',
      ggscoord: `${lat}|${lng}`,
      ggsradius: '10000',
      ggslimit: '6',
      prop: 'pageimages',
      pithumbsize: '960',
      piprop: 'thumbnail',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
      headers: WIKI_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    for (const page of pages as any[]) {
      const thumb = page?.thumbnail?.source;
      if (isUsablePhotoUrl(thumb)) {
        return {
          url: thumb,
          attribution: page?.title ? `Wikimedia Commons • ${page.title}` : 'Wikimedia Commons',
        };
      }
    }
  } catch {
    // Non-fatal
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawName = (searchParams.get('name') || '').trim();
  const city = (searchParams.get('city') || '').trim();
  const country = (searchParams.get('country') || '').trim();
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));

  // Clean activity titles like "Hike Mutianyu at sunrise — Great Wall of China" -> prefer location part
  const primaryLocationName = rawName.includes('—')
    ? rawName.split('—').pop()!.trim()
    : rawName.includes('&')
    ? rawName.split('&')[0].trim()
    : rawName;

  // Tier 1: Direct Wikipedia Summary by exact landmark/place name
  if (primaryLocationName) {
    const direct = await fetchWikiSummaryImage(primaryLocationName);
    if (direct) {
      return NextResponse.json({ imageUrl: direct.url, attribution: direct.attribution }, { headers: CACHE_HEADERS });
    }
  }

  // Tier 2: Wikipedia Search combining name + city + country
  const searchQuery = [primaryLocationName, city, country]
    .filter((part) => part && part.toLowerCase() !== 'earth' && part.toLowerCase() !== 'unknown')
    .join(' ');
  if (searchQuery) {
    const searched = await fetchWikiSearchImage(searchQuery);
    if (searched) {
      return NextResponse.json({ imageUrl: searched.url, attribution: searched.attribution }, { headers: CACHE_HEADERS });
    }
  }

  // Tier 3: Wikipedia Geosearch by GPS coordinates (great for custom pin titles!)
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    const geo = await fetchWikiGeosearchImage(lat, lng);
    if (geo) {
      return NextResponse.json({ imageUrl: geo.url, attribution: geo.attribution }, { headers: CACHE_HEADERS });
    }
  }

  // Tier 4: Fallback to City or Country real landmark photo
  for (const fallback of [city, country]) {
    if (fallback && fallback.toLowerCase() !== 'earth' && fallback.toLowerCase() !== 'unknown') {
      const fb = await fetchWikiSummaryImage(fallback);
      if (fb) {
        return NextResponse.json({ imageUrl: fb.url, attribution: fb.attribution }, { headers: CACHE_HEADERS });
      }
    }
  }

  return NextResponse.json({ imageUrl: null, attribution: null }, { headers: CACHE_HEADERS });
}
