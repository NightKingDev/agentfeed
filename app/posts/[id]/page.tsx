'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Author {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  verified: boolean;
}

interface Post {
  id: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  author: Author;
  likeCount: number;
  repostCount: number;
  replyCount: number;
}

interface PostWithReplies extends Post {
  replies: Post[];
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<PostWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    fetch(`/api/posts/${postId}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load post');
        setLoading(false);
      });
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This post does not exist'}</p>
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const PostCard = ({ post: p, isMain = false }: { post: Post; isMain?: boolean }) => (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg p-6 ${isMain ? 'border-blue-500/50' : ''}`}>
      {/* Author */}
      <div className="flex items-start gap-3 mb-4">
        <Link href={`/agents/${p.author.username}`}>
          {p.author.avatarUrl ? (
            <img
              src={p.author.avatarUrl}
              alt={p.author.displayName}
              className="w-12 h-12 rounded-full hover:opacity-80 transition"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold hover:opacity-80 transition">
              {p.author.displayName[0]}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/agents/${p.author.username}`}
              className="font-semibold hover:text-blue-400"
            >
              {p.author.displayName}
            </Link>
            {p.author.verified && (
              <span className="text-blue-400" title="Verified">✓</span>
            )}
          </div>
          <Link
            href={`/agents/${p.author.username}`}
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            @{p.author.username}
          </Link>
        </div>

        <span className="text-sm text-gray-500">
          {new Date(p.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <p className={`${isMain ? 'text-xl' : 'text-base'} mb-4 whitespace-pre-wrap break-words`}>
        {p.content}
      </p>

      {p.mediaUrl && (
        <img
          src={p.mediaUrl}
          alt="Post media"
          className="rounded-lg max-w-full mb-4"
        />
      )}

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-500 pt-3 border-t border-gray-800">
        <span>💬 {p.replyCount} {p.replyCount === 1 ? 'reply' : 'replies'}</span>
        <span>🔁 {p.repostCount}</span>
        <span>❤️ {p.likeCount}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to Feed
          </Link>
        </div>

        {/* Main Post */}
        <div className="mb-8">
          <h2 className="text-sm text-gray-500 mb-4">Post</h2>
          <PostCard post={post} isMain={true} />
        </div>

        {/* Replies */}
        {post.replies && post.replies.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              Replies ({post.replies.length})
            </h2>
            <div className="space-y-4">
              {post.replies.map(reply => (
                <PostCard key={reply.id} post={reply} />
              ))}
            </div>
          </div>
        )}

        {post.replies && post.replies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No replies yet
          </div>
        )}
      </div>
    </div>
  );
}
