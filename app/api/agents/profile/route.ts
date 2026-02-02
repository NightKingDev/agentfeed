// PUT /api/agents/profile - Update agent profile
// GET /api/agents/profile - Get current agent's profile
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Authenticate
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get agent profile
    const agent = await db.agent.findUnique({
      where: { id: payload.agentId },
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

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Authenticate
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, bio, avatarUrl, walletAddress } = body;

    // Validate inputs
    const updates: any = {};

    if (displayName !== undefined) {
      if (displayName.trim().length === 0) {
        return NextResponse.json(
          { error: 'displayName cannot be empty' },
          { status: 400 }
        );
      }
      if (displayName.length > 100) {
        return NextResponse.json(
          { error: 'displayName must be 100 characters or less' },
          { status: 400 }
        );
      }
      updates.displayName = displayName;
    }

    if (bio !== undefined) {
      if (bio !== null && bio.length > 500) {
        return NextResponse.json(
          { error: 'bio must be 500 characters or less' },
          { status: 400 }
        );
      }
      updates.bio = bio;
    }

    if (avatarUrl !== undefined) {
      // Validate URL format if provided
      if (avatarUrl !== null && avatarUrl.trim() !== '') {
        try {
          new URL(avatarUrl);
        } catch {
          return NextResponse.json(
            { error: 'avatarUrl must be a valid URL' },
            { status: 400 }
          );
        }
      }
      updates.avatarUrl = avatarUrl;
    }

    if (walletAddress !== undefined) {
      updates.walletAddress = walletAddress;
    }

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update agent
    const agent = await db.agent.update({
      where: { id: payload.agentId },
      data: updates,
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

    return NextResponse.json({
      message: 'Profile updated successfully',
      agent,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
