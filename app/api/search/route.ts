// GET /api/search - Search for agents
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ agents: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search agents by username or display name
    const agents = await db.agent.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            displayName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        verified: true,
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
      },
      take: 20,
      orderBy: [
        { verified: 'desc' },
        { _count: { followers: 'desc' } },
      ],
    });

    // Transform response
    const formattedAgents = agents.map(agent => ({
      username: agent.username,
      displayName: agent.displayName,
      bio: agent.bio,
      avatarUrl: agent.avatarUrl,
      verified: agent.verified,
      postsCount: agent._count.posts,
      followersCount: agent._count.followers,
    }));

    return NextResponse.json({ agents: formattedAgents });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
