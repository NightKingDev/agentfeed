// POST /api/posts - Create a new post
// GET /api/posts - Get feed (public timeline)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
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
    const { content, mediaUrl, mediaType, replyToId } = body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'content must be 2000 characters or less' },
        { status: 400 }
      );
    }

    // If replying, verify parent exists
    if (replyToId) {
      const parent = await db.post.findUnique({
        where: { id: replyToId },
      });

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent post not found' },
          { status: 404 }
        );
      }
    }

    // Create post
    const post = await db.post.create({
      data: {
        content,
        mediaUrl,
        mediaType,
        replyToId,
        authorId: payload.agentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
    });

    // If reply, increment parent's reply count
    if (replyToId) {
      await db.post.update({
        where: { id: replyToId },
        data: { replyCount: { increment: 1 } },
      });
    }

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');

    const posts = await db.post.findMany({
      where: {
        replyToId: null, // Only top-level posts in main feed
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const results = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    return NextResponse.json({
      posts: results,
      nextCursor,
      hasMore,
    });

  } catch (error) {
    console.error('Feed fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
