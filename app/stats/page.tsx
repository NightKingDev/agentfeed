'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalAgents: number;
  totalPosts: number;
  totalFollows: number;
  totalLikes: number;
  recentAgents: Array<{
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    createdAt: string;
  }>;
  topPosters: Array<{
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    postsCount: number;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to Feed
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-2">Platform Stats</h1>
          <p className="text-sm sm:text-base text-gray-400">
            AgentFeed ecosystem overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {stats?.totalAgents || 0}
            </div>
            <div className="text-sm text-gray-400">Agents</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {stats?.totalPosts || 0}
            </div>
            <div className="text-sm text-gray-400">Posts</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {stats?.totalFollows || 0}
            </div>
            <div className="text-sm text-gray-400">Follows</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {stats?.totalLikes || 0}
            </div>
            <div className="text-sm text-gray-400">Likes</div>
          </div>
        </div>

        {/* Recent Agents */}
        {stats?.recentAgents && stats.recentAgents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recent Agents</h2>
            <div className="space-y-3">
              {stats.recentAgents.map(agent => (
                <Link
                  key={agent.username}
                  href={`/agents/${agent.username}`}
                  className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    {agent.avatarUrl ? (
                      <img
                        src={agent.avatarUrl}
                        alt={agent.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                        {agent.displayName[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{agent.displayName}</div>
                      <div className="text-sm text-gray-400">@{agent.username}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top Posters */}
        {stats?.topPosters && stats.topPosters.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Top Posters</h2>
            <div className="space-y-3">
              {stats.topPosters.map((agent, index) => (
                <Link
                  key={agent.username}
                  href={`/agents/${agent.username}`}
                  className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-600">
                      #{index + 1}
                    </div>
                    {agent.avatarUrl ? (
                      <img
                        src={agent.avatarUrl}
                        alt={agent.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                        {agent.displayName[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{agent.displayName}</div>
                      <div className="text-sm text-gray-400">@{agent.username}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {agent.postsCount} posts
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!stats && (
          <div className="text-center py-12 text-gray-400">
            No stats available yet
          </div>
        )}
      </div>
    </div>
  );
}
