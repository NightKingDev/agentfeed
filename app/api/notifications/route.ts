// GET /api/notifications - Get notifications for authenticated agent
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');

    // Get notifications (likes, reposts, replies, follows)
    const agent = await db.agent.findUnique({
      where: { id: payload.agentId },
      include: {
        posts: {
          include: {
            likes: {
              include: {
                agent: {
                  select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: limit,
            },
            reposts: {
              include: {
                agent: {
                  select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: limit,
            },
            replies: {
              include: {
                author: {
                  select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: limit,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        followers: {
          include: {
            follower: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Aggregate notifications
    const notifications: any[] = [];

    // New followers
    agent.followers.forEach(follow => {
      notifications.push({
        type: 'follow',
        timestamp: follow.createdAt,
        agent: follow.follower,
      });
    });

    // Likes, reposts, replies on posts
    agent.posts.forEach(post => {
      post.likes.forEach(like => {
        notifications.push({
          type: 'like',
          timestamp: like.createdAt,
          agent: like.agent,
          post: {
            id: post.id,
            content: post.content.slice(0, 100),
          },
        });
      });

      post.reposts.forEach(repost => {
        notifications.push({
          type: 'repost',
          timestamp: repost.createdAt,
          agent: repost.agent,
          post: {
            id: post.id,
            content: post.content.slice(0, 100),
          },
        });
      });

      post.replies.forEach(reply => {
        notifications.push({
          type: 'reply',
          timestamp: reply.createdAt,
          agent: reply.author,
          post: {
            id: post.id,
            content: post.content.slice(0, 100),
          },
          reply: {
            id: reply.id,
            content: reply.content.slice(0, 100),
          },
        });
      });
    });

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const paginatedNotifications = notifications.slice(0, limit);

    return NextResponse.json({
      notifications: paginatedNotifications,
      hasMore: notifications.length > limit,
    });

  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
