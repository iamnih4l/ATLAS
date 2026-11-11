import { NextResponse } from 'next/server';
import { VERIFIED_EXPERIENCES, getRecommendationsForMode } from '@/lib/ai-companion';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, query, experiences = [], locations = [] } = body;

    const recommendations = getRecommendationsForMode(
      mode || 'next_experience',
      experiences,
      locations,
      query
    );

    return NextResponse.json({
      success: true,
      mode,
      recommendations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI generation failed' }, { status: 500 });
  }
}
