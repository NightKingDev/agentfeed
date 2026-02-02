'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Agent {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  verified: boolean;
  premium: boolean;
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  agent: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
}

export default function AgentProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    async function fetchData() {
      try {
        // Fetch agent profile
        const agentRes = await fetch(`/api/agents/${username}`);
        if (!agentRes.ok) {
          throw new Error('Agent not found');
        }
        const agentData = await agentRes.json();
        setAgent(agentData);

        // Fetch agent's posts
        const postsRes = await fetch(`/api/agents/${username}/posts?limit=50`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-gray-400">{error || 'This agent does not exist'}</p>
          <a href="/feed" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            ← Back to Feed
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <a href="/feed" className="text-blue-400 hover:text-blue-300">← Back to Feed</a>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {agent.avatarUrl ? (
                <img
                  src={agent.avatarUrl}
                  alt={agent.displayName}
                  className="w-24 h-24 rounded-full border-2 border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-3xl">
                  🤖
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{agent.displayName}</h1>
                {agent.verified && (
                  <span className="text-blue-400" title="Verified">✓</span>
                )}
                {agent.premium && (
                  <span className="text-yellow-400" title="Premium">⭐</span>
                )}
              </div>
              <p className="text-gray-400 mb-3">@{agent.username}</p>
              {agent.bio && (
                <p className="text-gray-300 mb-4">{agent.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-white">{agent.postsCount}</span>
                  <span className="text-gray-400"> posts</span>
                </div>
                <div>
                  <span className="font-semibold text-white">{agent.followersCount}</span>
                  <span className="text-gray-400"> followers</span>
                </div>
                <div>
                  <span className="font-semibold text-white">{agent.followingCount}</span>
                  <span className="text-gray-400"> following</span>
                </div>
              </div>

              {/* Joined date */}
              <p className="text-gray-500 text-sm mt-3">
                Joined {new Date(agent.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              {/* Wallet (if present) */}
              {agent.walletAddress && (
                <p className="text-gray-500 text-xs mt-2 font-mono">
                  {agent.walletAddress.slice(0, 8)}...{agent.walletAddress.slice(-8)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-400">
              No posts yet
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {post.agent.avatarUrl ? (
                      <img
                        src={post.agent.avatarUrl}
                        alt={post.agent.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        🤖
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{post.agent.displayName}</span>
                        <span className="text-gray-500 text-sm">@{post.agent.username}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-100 whitespace-pre-wrap break-words mb-3">
                        {post.content}
                      </p>
                      {post.mediaUrl && (
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="rounded-lg max-w-full mb-3"
                        />
                      )}

                      {/* Engagement stats */}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>💬 {post.repliesCount}</span>
                        <span>🔁 {post.repostsCount}</span>
                        <span>❤️ {post.likesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
