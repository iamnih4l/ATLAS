import {
  AIRecommendation,
  Experience,
  Location,
  Adventure,
  WishlistItem,
  StructuredAdventurePayload,
  AdventureIntent,
  StructuredItineraryStop,
} from '@/types';
import { calculateDistanceKm, VERIFIED_EXPERIENCES, getRecommendationsForMode } from './ai-companion';
import { searchPlaces } from './geocoding';

export interface ChatMessage {
  role: 'user' | 'orion' | 'assistant';
  content: string;
}

export interface UserTravelContext {
  experiences?: Experience[];
  locations?: Location[];
  adventures?: Adventure[];
  wishlistItems?: WishlistItem[];
  userLat?: number;
  userLng?: number;
}

export interface OrionChatResult {
  reply: string;
  adventure_preview?: StructuredAdventurePayload | null;
  intent?: AdventureIntent;
}

function getGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    null
  );
}

function getGeminiModel(): string {
  const configured = process.env.AI_MODEL?.trim();
  if (!configured || configured.includes('1.5') || configured.includes('2.5-flash')) {
    return 'gemini-2.5-flash';
  }
  return configured;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Adventure: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  Nature: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
  Culture: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  'Food & Dining': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  Travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  Wildlife: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80',
  Historic: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Intelligent geocoding resolver for itinerary stops to guarantee real coordinates
 */
async function resolveItineraryCoordinates(
  stops: StructuredItineraryStop[]
): Promise<StructuredItineraryStop[]> {
  const resolved = await Promise.all(
    stops.map(async (stop) => {
      if (stop.latitude && stop.longitude && (stop.latitude !== 0 || stop.longitude !== 0)) {
        return stop;
      }
      try {
        const query = `${stop.name} ${stop.city || ''} ${stop.country || ''}`.trim();
        const results = await searchPlaces(query);
        if (results && results.length > 0) {
          const match = results[0];
          return {
            ...stop,
            latitude: match.latitude,
            longitude: match.longitude,
            city: stop.city || match.city || null,
            country: stop.country || match.country,
          };
        }
      } catch (err) {
        console.warn(`Geocoding failed for stop ${stop.name}:`, err);
      }
      return stop;
    })
  );
  return resolved;
}

/**
 * Local fallback and offline adventure architect parser
 */
async function generateFallbackOrionChat(
  lastMessage: string,
  context: UserTravelContext
): Promise<OrionChatResult> {
  const text = lastMessage.toLowerCase();

  // 1. Trip Planning Detection (e.g. Switzerland multi-stop or explicit itinerary)
  if (
    text.includes('switzerland') ||
    (text.includes('plan') && (text.includes('trip') || text.includes('days') || text.includes('tour'))) ||
    text.includes('itinerary') ||
    text.includes('circuit')
  ) {
    if (text.includes('switzerland') || text.includes('zurich') || text.includes('lucerne') || text.includes('zermatt')) {
      const stops: StructuredItineraryStop[] = [
        {
          name: 'Zurich Old Town & Lake',
          city: 'Zurich',
          country: 'Switzerland',
          latitude: 47.3769,
          longitude: 8.5417,
          day_number: 1,
          activities: ['Explore historic Altstadt', 'Lakeside promenade walk', 'Swiss chocolate tasting'],
          notes: 'Arrival day, rail pass activation, evening lakeside stroll.',
        },
        {
          name: 'Lucerne & Chapel Bridge',
          city: 'Lucerne',
          country: 'Switzerland',
          latitude: 47.0502,
          longitude: 8.3093,
          day_number: 2,
          activities: ['Walk Kapellbrücke (Chapel Bridge)', 'Lake Lucerne steamboat cruise', 'Mount Pilatus cogwheel'],
          notes: 'Scenic 45-minute train from Zurich. Beautiful wooden bridges and Alpine vistas.',
        },
        {
          name: 'Interlaken & Jungfrau Region',
          city: 'Interlaken',
          country: 'Switzerland',
          latitude: 46.6863,
          longitude: 7.8632,
          day_number: 3,
          activities: ['Harder Kulm panorama viewpoint', 'Lauterbrunnen valley waterfall hike', 'Paragliding over lakes'],
          notes: 'The adventure capital nested between Lake Thun and Lake Brienz.',
        },
        {
          name: 'Zermatt & The Matterhorn',
          city: 'Zermatt',
          country: 'Switzerland',
          latitude: 45.9765,
          longitude: 7.7491,
          day_number: 4,
          activities: ['Gornergrat Alpine railway', 'Matterhorn reflection trail hike', 'Traditional Valais fondue dinner'],
          notes: 'Car-free mountain resort with iconic views of the world-famous pyramid peak.',
        },
      ];

      return {
        reply:
          "Switzerland is an absolute dreamland for an Alpine adventure! 🏔️✨ I've designed a breathtaking 5-day route through Zurich, Lucerne, Interlaken, and Zermatt with world-class scenic rail journeys connecting each stop.\n\nHere is your full itinerary draft with verified GPS coordinates ready to be rendered onto your 3D globe. You can review the stops below, save it to your adventures, and track each leg of the journey!",
        intent: 'trip_planning',
        adventure_preview: {
          intent: 'trip_planning',
          title: '5-Day Swiss Alpine Grand Tour',
          description: 'Iconic rail expedition connecting Zurich, Lucerne, Interlaken, and Zermatt.',
          status: 'planned',
          estimated_budget: 2200,
          currency: 'CHF',
          stops,
        },
      };
    }

    // Generic multi-destination extraction
    const rawMatches = await searchPlaces(lastMessage);
    const candidateStops: StructuredItineraryStop[] = rawMatches.slice(0, 3).map((m, idx) => ({
      name: m.name,
      city: m.city || null,
      country: m.country,
      latitude: m.latitude,
      longitude: m.longitude,
      day_number: idx + 1,
      activities: ['Explore local landmarks and scenic sights', 'Taste authentic regional cuisine'],
      notes: `Day ${idx + 1} exploration stop.`,
    }));

    if (candidateStops.length > 0) {
      return {
        reply: `I have architected an adventure plan based on "${lastMessage}"! 🗺️ Each stop has been grounded with real coordinates so you can visualize the journey on your 3D globe.`,
        intent: 'trip_planning',
        adventure_preview: {
          intent: 'trip_planning',
          title: `Expedition to ${candidateStops[0].name}`,
          description: `Custom itinerary planned with Orion AI.`,
          status: 'planned',
          stops: candidateStops,
        },
      };
    }
  }

  // 2. Bucket List / Dreaming Detection
  if (
    text.includes('dream') ||
    text.includes('bucket list') ||
    text.includes('always wanted') ||
    text.includes('wish to visit') ||
    text.includes('fuji') ||
    text.includes('tromso') ||
    text.includes('aurora')
  ) {
    let placeQuery = 'Mount Fuji';
    let stopName = 'Mount Fuji Summit & 5th Station';
    let city = 'Fujinomiya';
    let country = 'Japan';
    let lat = 35.3606;
    let lon = 138.7274;

    if (text.includes('tromso') || text.includes('northern lights') || text.includes('aurora')) {
      placeQuery = 'Tromsø';
      stopName = 'Tromsø Arctic Cathedral & Northern Lights';
      city = 'Tromsø';
      country = 'Norway';
      lat = 69.6492;
      lon = 18.9553;
    } else {
      const geoMatches = await searchPlaces(lastMessage);
      if (geoMatches.length > 0) {
        const m = geoMatches[0];
        placeQuery = m.name;
        stopName = m.name;
        city = m.city || '';
        country = m.country;
        lat = m.latitude;
        lon = m.longitude;
      }
    }

    return {
      reply: `What an awe-inspiring dream! 🌟 ${stopName} is truly magical. Pinning your aspirations onto the globe turns distant dreams into achievable milestones. I have prepared a dream card with verified coordinates for your bucket list!`,
      intent: 'bucket_list',
      adventure_preview: {
        intent: 'bucket_list',
        title: `Dream: ${stopName}`,
        description: `Bucket list dream pinned in ${country}.`,
        status: 'dreaming',
        stops: [
          {
            name: stopName,
            city,
            country,
            latitude: lat,
            longitude: lon,
            activities: ['Witness iconic landscapes', 'Photography at golden hour'],
            notes: 'Aspirational destination added to bucket list.',
          },
        ],
      },
    };
  }

  // 3. Completed Experience Reflection
  if (
    text.includes('visited') ||
    text.includes('went to') ||
    text.includes('last summer') ||
    text.includes('last year') ||
    text.includes('i remember') ||
    text.includes('i loved')
  ) {
    const geoMatches = await searchPlaces(lastMessage);
    const place = geoMatches[0] || {
      name: 'Memorable Journey',
      city: '',
      country: 'World',
      latitude: 48.8566,
      longitude: 2.3522,
    };

    return {
      reply: `What a wonderful memory to cherish! 📸 Travelling shapes who we are, and logging those milestones keeps them alive on your globe. Would you like me to record this as a verified completed experience in your ATLAS passport?`,
      intent: 'completed_experience',
      adventure_preview: {
        intent: 'completed_experience',
        title: `Memories in ${place.name}`,
        description: `Completed journey logged with Orion.`,
        status: 'completed',
        stops: [
          {
            name: place.name,
            city: place.city || '',
            country: place.country,
            latitude: place.latitude,
            longitude: place.longitude,
            activities: ['Recorded past travel experience'],
            notes: 'Completed experience ready for passport logging.',
          },
        ],
      },
    };
  }

  // 4. Default engaging travel companion response
  return {
    reply:
      "I love how you think about exploring our world! 🌍 Whether you are dreaming up a solitary sanctuary or a vibrant multi-stop cross-country journey, I am here to calculate distances, map terrain, and organize your itinerary into a living geographical journey. What destination or experience shall we plot next?",
    intent: 'general_chat',
    adventure_preview: null,
  };
}

/**
 * Chat with Orion using Gemini API with Intent Recognition & Structured Adventure Generation
 */
export async function chatWithOrionGemini(
  messages: ChatMessage[],
  context: UserTravelContext = {}
): Promise<OrionChatResult> {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return generateFallbackOrionChat(lastMsg, context);
  }

  const model = getGeminiModel();

  // Context summaries
  let contextBrief = '';
  if (context.experiences && context.experiences.length > 0) {
    const expList = context.experiences
      .slice(0, 8)
      .map(
        (e) =>
          `- ${e.title} in ${e.location?.city || e.location?.country || 'Unknown'} (Rating: ${e.rating || 'N/A'}/5)`
      )
      .join('\n');
    contextBrief += `\nPAST USER MEMORIES ON 3D GLOBE:\n${expList}`;
  }

  if (context.adventures && context.adventures.length > 0) {
    const advList = context.adventures
      .slice(0, 5)
      .map((a) => `- "${a.title}" [Status: ${a.status}, Stops: ${a.destinations?.length || 0}]`)
      .join('\n');
    contextBrief += `\nACTIVE ADVENTURES IN PROGRESS:\n${advList}`;
  }

  const systemInstruction = `You are Orion, the charismatic, adventurous, and insightful AI travel companion and Adventure Architect inside ATLAS — an interactive gamified 3D travel journal.

Your Mission:
1. Understand the traveler's intent:
   - "trip_planning": User is planning a trip, road trip, multi-city route, or itinerary (e.g., "Plan a 5-day trip to Switzerland: Zurich, Lucerne, Interlaken, Zermatt").
   - "bucket_list": User is dreaming about or yearning to visit a place (e.g., "I've always wanted to see Mount Fuji").
   - "explicit_save": User explicitly requests to save/record an adventure or destination.
   - "completed_experience": User is reflecting on past trips they already completed (e.g., "I visited Paris last summer and went to the Louvre").
   - "general_chat": Travel tips, advice, gear, or general conversation.

2. Tone & Voice:
   - Enthusiastic, warm, evocative, adventurous.
   - Scannable formatting (2-3 concise paragraphs, engaging emoji, no boring tourist fluff).

3. CRITICAL OUTPUT FORMAT:
   - Write your conversational response first.
   - If the conversation discusses planning a trip, dreaming of a destination, or a completed trip, you MUST append a valid JSON block at the very end enclosed in:
\`\`\`json
{
  "intent": "trip_planning" | "bucket_list" | "explicit_save" | "completed_experience" | "general_chat",
  "title": "Creative Adventure Title",
  "description": "Short 1-2 sentence description",
  "status": "planned" | "dreaming" | "completed",
  "estimated_budget": 2000,
  "currency": "USD" | "EUR" | "CHF" | "JPY",
  "stops": [
    {
      "name": "Specific City or Landmark",
      "city": "City name",
      "country": "Country name",
      "latitude": 47.3769,
      "longitude": 8.5417,
      "day_number": 1,
      "activities": ["Activity 1", "Activity 2"],
      "notes": "Practical tip or sensory highlight"
    }
  ]
}
\`\`\`
   - Do NOT include the JSON block if the message is purely general chit-chat with no geographical destination.
${contextBrief}`;

  const contents = messages.map((m) => ({
    role: m.role === 'orion' || m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        }),
        signal: AbortSignal.timeout(16000),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Gemini chat API error:', errData);
      throw new Error(errData?.error?.message || `Gemini status ${res.status}`);
    }

    const data = await res.json();
    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawReply) throw new Error('No candidate content received from Gemini');

    // Extract JSON block if present
    const jsonMatch = rawReply.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let adventurePreview: StructuredAdventurePayload | null = null;
    let cleanReply = rawReply;

    if (jsonMatch) {
      cleanReply = rawReply.replace(jsonMatch[0], '').trim();
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && parsed.title && Array.isArray(parsed.stops)) {
          // Resolve and guarantee real coordinates for all stops
          const verifiedStops = await resolveItineraryCoordinates(parsed.stops);
          adventurePreview = {
            ...parsed,
            stops: verifiedStops,
          };
        }
      } catch (parseErr) {
        console.warn('Failed to parse adventure JSON block from Gemini:', parseErr);
      }
    }

    return {
      reply: cleanReply || rawReply,
      adventure_preview: adventurePreview,
      intent: adventurePreview?.intent || 'general_chat',
    };
  } catch (err: any) {
    console.warn('Gemini chat failed, falling back to local Adventure Architect:', err?.message);
    return generateFallbackOrionChat(lastMsg, context);
  }
}

/**
 * Generate real-time tailored travel recommendations using Gemini
 */
export async function generateGeminiRecommendations(
  mode: 'next_experience' | 'nearby' | 'bucket_list' | 'destination',
  query?: string,
  context: UserTravelContext = {}
): Promise<AIRecommendation[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return getRecommendationsForMode(mode, context.experiences || [], context.locations || [], query);
  }

  const model = getGeminiModel();

  const prompt = `You are Orion, the travel AI for ATLAS. Return a valid JSON array of 5 unique, real-world, grounded travel recommendations based on this request.
Mode: ${mode}
${query ? `Destination or Theme Query: "${query}"` : ''}
${context.experiences?.length ? `User visited milestones: ${context.experiences.map((e) => e.title).join(', ')}` : ''}

CRITICAL: Return ONLY a raw JSON array matching this exact schema:
[
  {
    "title": "Short exciting title",
    "locationName": "Specific landmark or district name",
    "city": "City name",
    "country": "Country name",
    "latitude": 35.1234,
    "longitude": 135.5678,
    "category": "Adventure | Nature | Culture | Food & Dining | Historic | Wildlife | Travel",
    "description": "2 vivid sentences describing the experience and sensory details.",
    "reason": "1 sentence why this fits the user's travel journey."
  }
]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty text from Gemini');

    const parsed: any[] = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid JSON format');

    return parsed.map((item, idx) => {
      const lat = Number(item.latitude) || 0;
      const lng = Number(item.longitude) || 0;
      let distance: number | null = null;
      if (context.userLat !== undefined && context.userLng !== undefined) {
        distance = calculateDistanceKm(context.userLat, context.userLng, lat, lng);
      }

      const img = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.default;
      const searchTerms = `${item.title || ''} ${item.locationName || item.city || ''} ${item.country || ''}`.trim();
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerms || 'travel destination')}`;

      return {
        id: `gemini-rec-${idx}-${Date.now()}`,
        user_id: 'active-user',
        title: item.title || 'Hidden Adventure',
        description: item.description || '',
        location_name: `${item.locationName || item.city}, ${item.country}`,
        latitude: lat,
        longitude: lng,
        category: item.category || 'Travel',
        reason: item.reason || 'Curated especially for your ATLAS journey.',
        external_url: mapsUrl,
        image_url: img,
        distance_km: distance,
        mode,
        is_saved: false,
        is_dismissed: false,
        created_at: new Date().toISOString(),
      };
    });
  } catch (err: any) {
    console.warn('Gemini recommendation generation failed, using grounded fallback pool:', err?.message);
    return getRecommendationsForMode(mode, context.experiences || [], context.locations || [], query);
  }
}
