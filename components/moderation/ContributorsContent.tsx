'use client';

/**
 * Contributors Content Component
 * Leaderboard of top contributors
 */

import { useState } from 'react';
import Link from 'next/link';
import { FaTrophy, FaMedal, FaAward, FaArrowLeft, FaBan, FaUnlock } from 'react-icons/fa';
import type { SessionData } from '@/lib/auth';

interface Contributor {
  id: number;
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  is_moderator: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  total_edits: number;
  approved_edits: number;
  pending_edits: number;
  rejected_edits: number;
}

interface ContributorsContentProps {
  contributors: Contributor[];
  user: SessionData;
}

export default function ContributorsContent({ contributors, user }: ContributorsContentProps) {
  const [bannedUsers, setBannedUsers] = useState<Set<number>>(
    new Set(contributors.filter(c => c.is_banned).map(c => c.id))
  );
  const [loading, setLoading] = useState<number | null>(null);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <FaTrophy className="text-yellow-400 text-2xl" />;
      case 1:
        return <FaMedal className="text-gray-300 text-2xl" />;
      case 2:
        return <FaMedal className="text-orange-400 text-2xl" />;
      default:
        return <span className="text-arc-white/60 font-bold">#{index + 1}</span>;
    }
  };

  const getApprovalRate = (approved: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((approved / total) * 100);
  };

  const handleBan = async (userId: number) => {
    const reason = prompt('Enter ban reason (optional):');
    if (reason === null) return; // User cancelled

    setLoading(userId);
    try {
      const response = await fetch(`/api/moderation/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to ban user: ${error.error}`);
        return;
      }

      setBannedUsers(prev => new Set([...prev, userId]));
      alert('User banned successfully');
    } catch (error) {
      console.error('Ban error:', error);
      alert('Failed to ban user');
    } finally {
      setLoading(null);
    }
  };

  const handleUnban = async (userId: number) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    setLoading(userId);
    try {
      const response = await fetch(`/api/moderation/users/${userId}/ban`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to unban user: ${error.error}`);
        return;
      }

      setBannedUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      alert('User unbanned successfully');
    } catch (error) {
      console.error('Unban error:', error);
      alert('Failed to unban user');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/moderation"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
          style={{ backgroundColor: '#2d1f38', color: '#ffffff' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Top Contributors
          </h1>
          <p className="text-white/70">
            Leaderboard of the most active community contributors
          </p>
        </div>

        {/* Statistics */}
        <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
          <div className="flex items-center gap-3">
            <FaAward className="text-3xl" style={{ color: '#f1aa1c' }} />
            <div>
              <p className="text-2xl font-bold" style={{ color: '#f1aa1c' }}>{contributors.length}</p>
              <p className="text-white/60 text-sm">Active Contributors</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {contributors.length === 0 ? (
          <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120' }}>
            <p className="text-white/60 text-lg">No contributors yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contributors.map((contributor, index) => {
              const approvalRate = getApprovalRate(
                parseInt(contributor.approved_edits.toString()),
                parseInt(contributor.total_edits.toString())
              );
              const avatarUrl = contributor.discord_avatar
                ? `https://cdn.discordapp.com/avatars/${contributor.discord_id}/${contributor.discord_avatar}.png?size=64`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(contributor.discord_id) % 5}.png`;

              return (
                <div
                  key={contributor.id}
                  className="rounded-lg p-5 transition-all"
                  style={{
                    backgroundColor: '#1a1120',
                    border: index < 3 ? '1px solid rgba(241, 170, 28, 0.3)' : '1px solid #2d1f38'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(241, 170, 28, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = index < 3 ? 'rgba(241, 170, 28, 0.3)' : '#2d1f38';
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar */}
                    <img
                      src={avatarUrl}
                      alt={contributor.discord_username}
                      className="w-14 h-14 rounded-full flex-shrink-0"
                    />

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={`/profile/${contributor.discord_id}`}
                          className="text-white font-bold text-lg transition-all cursor-pointer"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f1aa1c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#ffffff';
                          }}
                        >
                          {contributor.discord_username}
                        </Link>
                        {contributor.is_moderator && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: '#f1aa1c', color: '#130918' }}>
                            MOD
                          </span>
                        )}
                        {bannedUsers.has(contributor.id) && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900/50 text-red-300 border border-red-500/50">
                            BANNED
                          </span>
                        )}
                      </div>

                      {bannedUsers.has(contributor.id) && contributor.ban_reason && (
                        <p className="text-red-300/80 text-xs italic mb-2">
                          Reason: {contributor.ban_reason}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div>
                          <span className="font-bold" style={{ color: '#f1aa1c' }}>
                            {contributor.total_edits}
                          </span>
                          <span className="text-white/60 ml-1">Total Edits</span>
                        </div>
                        <div>
                          <span className="text-green-400 font-bold">
                            {contributor.approved_edits}
                          </span>
                          <span className="text-white/60 ml-1">Approved</span>
                        </div>
                        <div>
                          <span className="text-yellow-400 font-bold">
                            {contributor.pending_edits}
                          </span>
                          <span className="text-white/60 ml-1">Pending</span>
                        </div>
                        <div>
                          <span className="text-red-400 font-bold">
                            {contributor.rejected_edits}
                          </span>
                          <span className="text-white/60 ml-1">Rejected</span>
                        </div>
                      </div>
                    </div>

                    {/* Approval Rate & Actions */}
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`text-2xl font-bold ${
                          approvalRate >= 75
                            ? 'text-green-400'
                            : approvalRate >= 50
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {approvalRate}%
                      </div>
                      <div className="text-white/60 text-xs mb-2">Approval Rate</div>

                      {/* Ban/Unban Button */}
                      {!contributor.is_moderator && contributor.id !== user.userId && (
                        <button
                          onClick={() => bannedUsers.has(contributor.id) ? handleUnban(contributor.id) : handleBan(contributor.id)}
                          disabled={loading === contributor.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-50"
                          style={{
                            backgroundColor: bannedUsers.has(contributor.id) ? '#16a34a' : '#dc2626',
                            color: '#ffffff'
                          }}
                          onMouseEnter={(e) => {
                            if (loading !== contributor.id) {
                              e.currentTarget.style.opacity = '0.8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (loading !== contributor.id) {
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                        >
                          {loading === contributor.id ? (
                            <span>Loading...</span>
                          ) : bannedUsers.has(contributor.id) ? (
                            <>
                              <FaUnlock />
                              Unban
                            </>
                          ) : (
                            <>
                              <FaBan />
                              Ban
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
