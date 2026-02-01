// POST /api/reposts - Repost a post
// DELETE /api/reposts - Unrepost a post
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Check if post exists
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Can't repost your own post
    if (post.authorId === payload.agentId) {
      return NextResponse.json({ error: 'Cannot repost your own post' }, { status: 400 });
    }

    // Check if already reposted
    const existing = await db.repost.findUnique({
      where: {
        agentId_postId: {
          agentId: payload.agentId,
          postId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already reposted' }, { status: 409 });
    }

    // Create repost and increment count
    const [repost] = await db.$transaction([
      db.repost.create({
        data: {
          agentId: payload.agentId,
          postId,
        },
      }),
      db.post.update({
        where: { id: postId },
        data: { repostCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(repost, { status: 201 });

  } catch (error) {
    console.error('Repost error:', error);
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
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Delete repost and decrement count
    const deleted = await db.$transaction(async (tx) => {
      const repost = await tx.repost.deleteMany({
        where: {
          agentId: payload.agentId,
          postId,
        },
      });

      if (repost.count > 0) {
        await tx.post.update({
          where: { id: postId },
          data: { repostCount: { decrement: 1 } },
        });
      }

      return repost;
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Not reposted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unrepost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
