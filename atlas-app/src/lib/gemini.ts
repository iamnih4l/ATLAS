import { AIRecommendation, Experience, Location } from '@/types';
import { calculateDistanceKm, VERIFIED_EXPERIENCES, getRecommendationsForMode } from './ai-companion';

export interface ChatMessage {
  role: 'user' | 'orion';
  content: string;
}

export interface UserTravelContext {
  experiences?: Experience[];
  locations?: Location[];
  userLat?: number;
  userLng?: number;
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
  // If set to older or deprecated models, default to the latest fast model
  if (!configured || configured.includes('1.5') || configured.includes('2.5-flash')) {
    return 'gemini-3.5-flash-lite';
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
 * Chat with Orion using Gemini API
 */
export async function chatWithOrionGemini(
  messages: ChatMessage[],
  context: UserTravelContext = {}
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return "I am operating in offline demo mode right now because no Gemini API key was detected. Once configured, I can generate real-time live travel insights!";
  }

  const model = getGeminiModel();

  // Build context summary from past experiences
  let contextBrief = '';
  if (context.experiences && context.experiences.length > 0) {
    const list = context.experiences
      .slice(0, 10)
      .map(
        (e) =>
          `- ${e.title} in ${e.location?.city || e.location?.country || 'Unknown'} (Rating: ${e.rating || 'N/A'}/5)`
      )
      .join('\n');
    contextBrief = `\nThe user has recorded these experiences on their 3D globe:\n${list}\nUse this context to tailor advice, celebrate past milestones, or contrast new ideas.`;
  }

  const systemInstruction = `You are Orion, the charismatic, adventurous, and insightful AI travel companion inside ATLAS — an interactive gamified 3D travel journal. 
Your goal is to inspire the user's wanderlust, suggest authentic hidden gems, give practical local tips, and connect their past memories to new dream destinations.
Style guidelines:
- Speak warmly with enthusiastic, adventurous energy.
- Keep responses scannable, engaging, and concise (2-4 paragraphs or a short bullet list).
- Always ground ideas in real geographical places with vivid sensory descriptions.
- Avoid boring tourist cliches; favor genuine local spots, viewpoints, and cultural experiences.${contextBrief}`;

  // Map messages to Gemini API format
  const contents = messages.map((m) => ({
    role: m.role === 'orion' ? 'model' : 'user',
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
            maxOutputTokens: 600,
          },
        }),
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Gemini chat API error:', errData);
      throw new Error(errData?.error?.message || `Gemini status ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) return reply.trim();
    throw new Error('No candidate content received from Gemini');
  } catch (err: any) {
    console.error('Gemini chat failed, falling back:', err?.message);
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastMsg.includes('japan') || lastMsg.includes('tokyo') || lastMsg.includes('kyoto')) {
      return "Since you love exploring Japan, consider venturing out to the sacred mist-shrouded cedar forests of Kumano Kodo in Wakayama! It's one of only two UNESCO pilgrimage routes in the world.";
    }
    return "That sounds like a thrilling expedition! Exploring new horizons expands your ATLAS passport. Check out the verified coordinate cards below for handpicked spots!";
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
    "reason": "1 sentence why this fits the user's travel journey.",
    "externalUrl": "https://official-tourism-link-or-blank"
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
        external_url: item.externalUrl || null,
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

