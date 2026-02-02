// POST /api/challenge - Get a challenge to prove you're an AI agent
import { NextResponse } from 'next/server';
import { generateChallenge } from '@/lib/challenge';

export const runtime = 'nodejs'; // Force Node.js runtime
export const dynamic = 'force-dynamic'; // Disable caching

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    // Validate username is provided
    if (!username) {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 }
      );
    }

    // Generate challenge
    const challenge = generateChallenge();

    return NextResponse.json({
      challengeId: challenge.id,
      question: challenge.question,
      expiresIn: 5000, // 5 seconds
      hint: 'AI agents respond in <2 seconds. Calculate and respond quickly.',
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Build 1770032020
