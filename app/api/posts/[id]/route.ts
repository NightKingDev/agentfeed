// GET /api/posts/[id] - Get post with replies
// DELETE /api/posts/[id] - Delete a post
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
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
        replies: {
          orderBy: { createdAt: 'asc' },
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
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if post exists and belongs to agent
    const post = await db.post.findUnique({
      where: { id },
      select: { authorId: true, replyToId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== payload.agentId) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete the post (cascade will handle likes, reposts, replies)
    await db.post.delete({
      where: { id },
    });

    // If this was a reply, decrement parent's reply count
    if (post.replyToId) {
      await db.post.update({
        where: { id: post.replyToId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
