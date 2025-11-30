'use client';

/**
 * Comment Thread Component
 * Display and add comments on edit proposals
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaPaperPlane } from 'react-icons/fa';
import { formatDistanceToNow } from '@/lib/dateUtils';

interface User {
  id: number;
  discordUsername: string;
  discordAvatar: string | null;
  isModerator: boolean;
}

interface Comment {
  id: number;
  edit_id: number;
  user_id: number | null;
  comment: string;
  created_at: string;
  user: User | null;
}

interface CommentThreadProps {
  editId: number;
}

export default function CommentThread({ editId }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();

    // Poll for new comments every 10 seconds
    const interval = setInterval(fetchComments, 10000);

    return () => clearInterval(interval);
  }, [editId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/edits/${editId}/comments`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/edits/${editId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([...comments, data.comment]);
        setNewComment('');
      } else {
        alert(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
      <h3 className="text-white font-bold mb-4">Comments ({comments.length})</h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {loading && comments.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">No comments yet</p>
        ) : (
          comments.map((comment) => {
            const avatar = comment.user?.discordAvatar
              ? `https://cdn.discordapp.com/avatars/${comment.user.id}/${comment.user.discordAvatar}.png?size=64`
              : `https://cdn.discordapp.com/embed/avatars/${(comment.user?.id || 0) % 5}.png`;

            return (
              <div key={comment.id} className="flex gap-3">
                {comment.user && (
                  <img
                    src={avatar}
                    alt={comment.user.discordUsername}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium">
                      {comment.user?.discordUsername || 'Unknown'}
                    </span>
                    {comment.user?.isModerator && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#f1aa1c', color: '#130918' }}>
                        MOD
                      </span>
                    )}
                    <span className="text-white/40 text-xs">
                      {formatDistanceToNow(new Date(comment.created_at))}
                    </span>
                  </div>

                  <p className="text-white/80 text-sm whitespace-pre-wrap break-words">
                    {comment.comment}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="pt-4" style={{ borderTop: '1px solid #2d1f38' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none resize-none mb-3 transition-all"
            style={{ backgroundColor: '#130918', border: '2px solid #2d1f38' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f1aa1c';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#2d1f38';
            }}
          />

          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
            onMouseEnter={(e) => {
              if (!submitting && newComment.trim()) {
                e.currentTarget.style.backgroundColor = '#d99a19';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && newComment.trim()) {
                e.currentTarget.style.backgroundColor = '#f1aa1c';
              }
            }}
          >
            <FaPaperPlane />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </form>
      )}

      {!user && (
        <div className="pt-4" style={{ borderTop: '1px solid #2d1f38' }}>
          <p className="text-white/60 text-sm text-center">
            You must be logged in to comment
          </p>
        </div>
      )}
    </div>
  );
}
