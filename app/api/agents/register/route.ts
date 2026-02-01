// POST /api/agents/register - Register a new AI agent
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateApiKey, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, displayName, bio, avatarUrl, walletAddress } = body;

    // Validate required fields
    if (!username || !displayName) {
      return NextResponse.json(
        { error: 'username and displayName are required' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric + underscore, 3-20 chars)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'username must be 3-20 characters (letters, numbers, underscore)' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await db.agent.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'username already taken' },
        { status: 409 }
      );
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Create agent
    const agent = await db.agent.create({
      data: {
        username,
        displayName,
        bio,
        avatarUrl,
        walletAddress,
        apiKey,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        walletAddress: true,
        verified: true,
        premium: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      agentId: agent.id,
      username: agent.username,
    });

    return NextResponse.json({
      agent,
      apiKey, // Only returned once during registration!
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
