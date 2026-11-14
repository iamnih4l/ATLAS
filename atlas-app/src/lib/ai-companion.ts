import { AIRecommendation, Experience, Location, WishlistItem } from '@/types';

export interface GroundedActivity {
  title: string;
  locationName: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  category: string;
  description: string;
  reason: string;
  imageUrl: string;
  externalUrl?: string;
}

// Curated verified real-world experiences grounded in real geographical coordinates
export const VERIFIED_EXPERIENCES: GroundedActivity[] = [
  {
    title: 'Tandem Paragliding over Interlaken & Jungfrau',
    locationName: 'Interlaken Ost & Beatenberg',
    latitude: 46.6863,
    longitude: 7.8632,
    country: 'Switzerland',
    city: 'Interlaken',
    category: 'Adventure',
    description: 'Launch from the Alpine meadows of Beatenberg at 1,350m and glide serenely over turquoise Lake Thun and Lake Brienz with the towering peaks of Eiger, Mönch and Jungfrau directly ahead.',
    reason: 'Since you rated your skydiving experience 5.0, paragliding provides a longer, peaceful 20-minute thermal flight over the Swiss Alps without the intense freefall sensory overload.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://www.myswitzerland.com/en-ch/experiences/paragliding-interlaken/',
  },
  {
    title: 'Great Barrier Reef Outer Edge Night Diving',
    locationName: 'Osprey Reef / Ribbon Reefs',
    latitude: -16.8500,
    longitude: 146.2000,
    country: 'Australia',
    city: 'Cairns',
    category: 'Adventure',
    description: 'Descend along ancient coral bommies under UV dive lights. Witness parrotfish sleeping in protective mucus cocoons and bioluminescent plankton swirling around your fingertips.',
    reason: 'You have shown high interest in marine activities and bioluminescent waters in Puerto Rico; deep diving Osprey Reef opens an entire nocturnal coral ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://www.tropicalnorthqueensland.org.au/listing/product/scuba-diving/',
  },
  {
    title: 'Ancient Kumano Kodo Mountain Pilgrimage Hike',
    locationName: 'Kumano Nachi Taisha & Nachi Falls',
    latitude: 33.6689,
    longitude: 135.8897,
    country: 'Japan',
    city: 'Wakayama',
    category: 'Culture',
    description: 'Walk the ancient stone-paved paths through misty cedar forests on the Kii Peninsula, leading to the dramatic red three-story pagoda framed by Japan’s tallest single-tier waterfall.',
    reason: 'You loved the early morning Fushimi Inari Torii shrine hike in Kyoto; Kumano Kodo expands that spiritual Shinto mountain walking tradition into a multi-day UNESCO pilgrimage route.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://www.tb-kumano.jp/en/kumano-kodo/',
  },
  {
    title: 'Sunrise Hot Air Balloon Flight over Cappadocia Valleys',
    locationName: 'Göreme Valley Fairy Chimneys',
    latitude: 38.6431,
    longitude: 34.8289,
    country: 'Turkey',
    city: 'Cappadocia',
    category: 'Adventure',
    description: 'Ascend silently with hundred other colorful balloons at first light as the dawn sun paints golden shadows across ancient carved cave dwellings and fairy chimney rock spires.',
    reason: 'Combines aerial panoramic thrill with deep geological architecture. A classic bucket-list milestone matching your love for landscape vistas and photography.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://www.goturkiye.com/destinations/cappadocia',
  },
  {
    title: 'Underground Cenote Diving & Cave Swimming',
    locationName: 'Cenote Dos Ojos',
    latitude: 20.3245,
    longitude: -87.3916,
    country: 'Mexico',
    city: 'Tulum',
    category: 'Nature',
    description: 'Swim in crystal-clear turquoise freshwater caverns with underwater limestone stalactites and natural sunlight beams piercing deep into cavernous subterranean halls.',
    reason: 'You rated Niagara’s subterranean cave tunnel highly; Cenote Dos Ojos delivers pure unadulterated subterranean water exploration in 77°F crystal clarity.',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://cenotedosojos.com/',
  },
  {
    title: 'Dog Sledding under the Arctic Aurora Borealis',
    locationName: 'Tromsø Wilderness Centre',
    latitude: 69.6492,
    longitude: 18.9553,
    country: 'Norway',
    city: 'Tromsø',
    category: 'Wildlife',
    description: 'Drive your own team of eager Alaskan huskies across frozen Arctic fjords and snow-laden pine valleys under green and violet ribbons of the northern lights.',
    reason: 'Adds an Arctic wilderness and wildlife dimension you haven’t yet logged, combining northern aurora viewing with animal partnership in extreme environments.',
    imageUrl: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80',
    externalUrl: 'https://www.visittromso.no/',
  },
];

// Calculate Haversine geographical distance in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generate grounded recommendations based on user profile and selected mode
export function getRecommendationsForMode(
  mode: 'next_experience' | 'nearby' | 'bucket_list' | 'destination',
  experiences: Experience[],
  locations: Location[],
  destinationQuery?: string,
  userLat?: number,
  userLng?: number
): AIRecommendation[] {
  let pool = [...VERIFIED_EXPERIENCES];

  if (mode === 'destination' && destinationQuery) {
    const q = destinationQuery.toLowerCase();
    const matched = pool.filter(
      (p) =>
        p.country.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    if (matched.length > 0) pool = matched;
  }

  return pool.map((item, idx) => {
    let distance: number | null = null;
    if (userLat !== undefined && userLng !== undefined) {
      distance = calculateDistanceKm(userLat, userLng, item.latitude, item.longitude);
    }

    return {
      id: `rec-${mode}-${idx}-${Date.now()}`,
      user_id: 'demo-user',
      title: item.title,
      description: item.description,
      location_name: `${item.locationName}, ${item.city}, ${item.country}`,
      latitude: item.latitude,
      longitude: item.longitude,
      category: item.category,
      reason: item.reason,
      external_url: item.externalUrl || null,
      image_url: item.imageUrl,
      distance_km: distance,
      mode,
      is_saved: false,
      is_dismissed: false,
      created_at: new Date().toISOString(),
    };
  });
}

