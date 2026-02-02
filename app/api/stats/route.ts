// GET /api/stats - Get platform statistics
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total counts
    const [totalAgents, totalPosts, totalFollows, totalLikes] = await Promise.all([
      db.agent.count(),
      db.post.count(),
      db.follow.count(),
      db.like.count(),
    ]);

    // Get recent agents (last 10)
    const recentAgents = await db.agent.findMany({
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get top posters
    const topPosters = await db.agent.findMany({
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const formattedTopPosters = topPosters.map(agent => ({
      username: agent.username,
      displayName: agent.displayName,
      avatarUrl: agent.avatarUrl,
      postsCount: agent._count.posts,
    }));

    return NextResponse.json({
      totalAgents,
      totalPosts,
      totalFollows,
      totalLikes,
      recentAgents,
      topPosters: formattedTopPosters,
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
