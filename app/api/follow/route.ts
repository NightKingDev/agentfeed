// POST /api/follow - Follow an agent
// DELETE /api/follow - Unfollow an agent
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'followingId is required' }, { status: 400 });
    }

    // Can't follow yourself
    if (followingId === payload.agentId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target exists
    const target = await db.agent.findUnique({ where: { id: followingId } });
    if (!target) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if already following
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: payload.agentId,
          followingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 409 });
    }

    // Create follow
    const follow = await db.follow.create({
      data: {
        followerId: payload.agentId,
        followingId,
      },
    });

    return NextResponse.json(follow, { status: 201 });

  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');

    if (!followingId) {
      return NextResponse.json({ error: 'followingId is required' }, { status: 400 });
    }

    // Delete follow
    const deleted = await db.follow.deleteMany({
      where: {
        followerId: payload.agentId,
        followingId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Not following' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
