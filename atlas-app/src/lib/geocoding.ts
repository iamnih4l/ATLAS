export interface GeocodingResult {
  place_id: string;
  name: string;
  display_name: string;
  city: string;
  country: string;
  venue: string;
  latitude: number;
  longitude: number;
  type?: string;
}

// Nominatim OpenStreetMap Geocoding (real-world places, verified coordinates)
export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Atlas-Experience-Journal/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim geocoding error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item: any) => {
      const address = item.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        '';
      const country = address.country || '';
      const venue =
        address.attraction ||
        address.amenity ||
        address.leisure ||
        address.tourism ||
        address.building ||
        item.name ||
        '';

      return {
        place_id: String(item.place_id),
        name: item.name || query,
        display_name: item.display_name,
        city,
        country,
        venue,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
      };
    });
  } catch (error) {
    console.error('Error during geocoding search:', error);
    // Provide known accurate coordinates for common landmarks if network blocks
    return getOfflinePlaceMatches(query);
  }
}

// Reverse Geocoding: Given GPS Lat/Lng from EXIF, return the real-world venue, city and country
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ name: string; city: string; country: string; venue: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Atlas-Experience-Journal/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      '';
    const country = address.country || '';
    const venue =
      address.attraction ||
      address.tourism ||
      address.amenity ||
      address.historic ||
      address.building ||
      data.name ||
      '';

    const name = venue ? `${venue}, ${city}` : city || data.display_name.split(',')[0];

    return {
      name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city,
      country,
      venue,
    };
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}

// Curated verified landmark database for instant offline/fallback accuracy
function getOfflinePlaceMatches(query: string): GeocodingResult[] {
  const q = query.toLowerCase();
  const knownPlaces: GeocodingResult[] = [
    {
      place_id: 'pl-skydive-dubai',
      name: 'Skydive Dubai — Palm Dropzone',
      display_name: 'Skydive Dubai, Al Seyahi St, Dubai Marina, Dubai, United Arab Emirates',
      city: 'Dubai',
      country: 'United Arab Emirates',
      venue: 'Palm Dropzone',
      latitude: 25.0931,
      longitude: 55.1384,
    },
    {
      place_id: 'pl-niagara-falls',
      name: 'Niagara Falls (Horseshoe Falls)',
      display_name: 'Horseshoe Falls, Niagara Falls, Ontario, Canada',
      city: 'Niagara Falls',
      country: 'Canada',
      venue: 'Horseshoe Falls',
      latitude: 43.0799,
      longitude: -79.0747,
    },
    {
      place_id: 'pl-fushimi-inari',
      name: 'Fushimi Inari Taisha',
      display_name: 'Fushimi Inari Shrine, 68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, Japan',
      city: 'Kyoto',
      country: 'Japan',
      venue: 'Shinto Shrine',
      latitude: 34.9671,
      longitude: 135.7727,
    },
    {
      place_id: 'pl-eiffel-tower',
      name: 'Eiffel Tower',
      display_name: 'Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      city: 'Paris',
      country: 'France',
      venue: 'Champ de Mars',
      latitude: 48.8584,
      longitude: 2.2945,
    },
    {
      place_id: 'pl-machu-picchu',
      name: 'Machu Picchu Historic Sanctuary',
      display_name: 'Machu Picchu, Urubamba Province, Cusco, Peru',
      city: 'Cusco',
      country: 'Peru',
      venue: 'Incan Citadel',
      latitude: -13.1631,
      longitude: -72.5450,
    },
    {
      place_id: 'pl-santorini',
      name: 'Oia Village Caldera',
      display_name: 'Oia, Santorini, Cyclades, Greece',
      city: 'Santorini',
      country: 'Greece',
      venue: 'Caldera Cliffside',
      latitude: 36.4618,
      longitude: 25.3753,
    },
    {
      place_id: 'pl-banff',
      name: 'Lake Louise & Moraine Lake',
      display_name: 'Banff National Park, Alberta, Canada',
      city: 'Banff',
      country: 'Canada',
      venue: 'Rocky Mountains Glacial Lake',
      latitude: 51.4254,
      longitude: -116.1773,
    },
  ];

  return knownPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.display_name.toLowerCase().includes(q)
  );
}
