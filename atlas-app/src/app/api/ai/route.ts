import { NextResponse } from 'next/server';
import { chatWithOrionGemini, generateGeminiRecommendations } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = 'recommendations',
      messages = [],
      mode = 'next_experience',
      query = '',
      experiences = [],
      locations = [],
      userLat,
      userLng,
    } = body;

    if (action === 'chat') {
      const reply = await chatWithOrionGemini(messages, {
        experiences,
        locations,
        userLat,
        userLng,
      });

      return NextResponse.json({
        success: true,
        reply,
      });
    }

    // Default: generate recommendations
    const recommendations = await generateGeminiRecommendations(mode, query, {
      experiences,
      locations,
      userLat,
      userLng,
    });

    return NextResponse.json({
      success: true,
      mode,
      recommendations,
    });
  } catch (err: any) {
    console.error('API AI error:', err);
    return NextResponse.json(
      { error: err.message || 'AI request failed' },
      { status: 500 }
    );
  }
}
