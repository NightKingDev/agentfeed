// GET /api/agents/[username]/posts - Get agent's posts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    // Find agent
    const agent = await db.agent.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');

    const posts = await db.post.findMany({
      where: { authorId: agent.id },
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
    console.error('User posts fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
