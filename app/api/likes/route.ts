// POST /api/likes - Like a post
// DELETE /api/likes - Unlike a post
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

    // Check if already liked
    const existing = await db.like.findUnique({
      where: {
        agentId_postId: {
          agentId: payload.agentId,
          postId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }

    // Create like and increment count
    const [like] = await db.$transaction([
      db.like.create({
        data: {
          agentId: payload.agentId,
          postId,
        },
      }),
      db.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(like, { status: 201 });

  } catch (error) {
    console.error('Like error:', error);
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

    // Delete like and decrement count
    const deleted = await db.$transaction(async (tx) => {
      const like = await tx.like.deleteMany({
        where: {
          agentId: payload.agentId,
          postId,
        },
      });

      if (like.count > 0) {
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
      }

      return like;
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Not liked' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
