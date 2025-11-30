'use client';

/**
 * Edit Review Content
 * Complete review interface for a single edit proposal
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionData } from '@/lib/auth';
import DiffViewer from './DiffViewer';
import ApprovalActions from './ApprovalActions';
import CommentThread from './CommentThread';
import { FaArrowLeft, FaUser, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { formatDate } from '@/lib/dateUtils';

interface User {
  id: number;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  isModerator: boolean;
}

interface EditProposal {
  id: number;
  item_id: string;
  user_id: number | null;
  status: 'pending' | 'approved' | 'rejected';
  edit_data: Record<string, unknown>;
  original_data: Record<string, unknown>;
  reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  user: User | null;
  reviewer: User | null;
}

interface EditReviewContentProps {
  editId: number;
  user: SessionData;
}

export default function EditReviewContent({ editId, user }: EditReviewContentProps) {
  const router = useRouter();
  const [edit, setEdit] = useState<EditProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEdit();
  }, [editId]);

  const fetchEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/edits/${editId}`);
      const data = await response.json();

      if (response.ok) {
        setEdit(data.edit);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch edit');
      }
    } catch (err) {
      console.error('Failed to fetch edit:', err);
      setError('Failed to fetch edit');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!edit) return;

    const confirmed = confirm(
      'Are you sure you want to approve this edit? The changes will be published immediately.'
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/edits/${editId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Edit approved successfully!');
        router.push('/moderation');
      } else {
        alert(data.error || 'Failed to approve edit');
      }
    } catch (err) {
      console.error('Failed to approve edit:', err);
      alert('Failed to approve edit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!edit) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/edits/${editId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Edit rejected successfully!');
        router.push('/moderation');
      } else {
        alert(data.error || 'Failed to reject edit');
      }
    } catch (err) {
      console.error('Failed to reject edit:', err);
      alert('Failed to reject edit');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#130918' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 rounded-full mx-auto mb-4" style={{ border: '4px solid #f1aa1c', borderTopColor: 'transparent' }}></div>
          <p className="text-white/60">Loading edit...</p>
        </div>
      </div>
    );
  }

  if (error || !edit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#130918' }}>
        <div className="rounded-lg p-8 max-w-md" style={{ backgroundColor: '#1a1120', border: '1px solid #ef4444' }}>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-white/80 mb-6">{error || 'Edit not found'}</p>
          <Link
            href="/moderation"
            className="inline-block px-6 py-3 font-bold rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d99a19';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1aa1c';
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const avatar = edit.user?.discordAvatar
    ? `https://cdn.discordapp.com/avatars/${edit.user.discordId}/${edit.user.discordAvatar}.png?size=128`
    : edit.user?.discordId
    ? `https://cdn.discordapp.com/embed/avatars/${parseInt(edit.user.discordId) % 5}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
      case 'approved':
        return 'text-green-400 border-green-500/50 bg-green-900/20';
      case 'rejected':
        return 'text-red-400 border-red-500/50 bg-red-900/20';
      default:
        return 'text-arc-white border-arc-blue-lighter bg-arc-blue-lighter/20';
    }
  };

  const getItemName = () => {
    // Try to get name from edit_data first (if name was edited)
    if (edit.edit_data.name && typeof edit.edit_data.name === 'string') {
      return edit.edit_data.name;
    }
    if (edit.edit_data.nameTranslations && typeof edit.edit_data.nameTranslations === 'object') {
      const translations = edit.edit_data.nameTranslations as Record<string, string>;
      const name = translations.en || Object.values(translations)[0];
      if (name) return name;
    }

    // Fall back to original_data
    if (edit.original_data.name && typeof edit.original_data.name === 'string') {
      return edit.original_data.name;
    }
    if (edit.original_data.nameTranslations && typeof edit.original_data.nameTranslations === 'object') {
      const translations = edit.original_data.nameTranslations as Record<string, string>;
      const name = translations.en || Object.values(translations)[0];
      if (name) return name;
    }

    return 'Unknown Item';
  };

  const itemName = getItemName();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/moderation"
            className="inline-flex items-center gap-2 mb-4 cursor-pointer transition-all"
            style={{ color: '#f1aa1c' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(241, 170, 28, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#f1aa1c';
            }}
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Edit Review #{edit.id}
              </h1>
              <p className="text-white/70 text-lg">{itemName}</p>
              <p className="text-white/50 text-sm">Item ID: {edit.item_id}</p>
            </div>

            <span
              className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-bold ${getStatusColor(
                edit.status
              )}`}
            >
              {edit.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contributor Info */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
              <h2 className="text-white font-bold text-lg mb-4">Contributor</h2>
              <div className="flex items-center gap-4">
                {edit.user && (
                  <>
                    <img
                      src={avatar}
                      alt={edit.user.discordUsername}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="text-white font-bold text-lg">
                        {edit.user.discordUsername}
                      </p>
                      <p className="text-white/60 text-sm flex items-center gap-2">
                        <FaClock />
                        {formatDate(edit.created_at)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {edit.reason && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2d1f38' }}>
                  <p className="text-white/60 text-sm mb-2">Reason:</p>
                  <p className="text-white italic">"{edit.reason}"</p>
                </div>
              )}
            </div>

            {/* Diff Viewer */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
              <DiffViewer
                original={edit.original_data}
                modified={edit.edit_data}
                title="Proposed Changes"
              />
            </div>

            {/* Approval Actions (only for pending edits) */}
            {edit.status === 'pending' && (
              <ApprovalActions
                onApprove={handleApprove}
                onReject={handleReject}
                loading={actionLoading}
              />
            )}

            {/* Reviewed Info (for approved/rejected edits) */}
            {edit.status !== 'pending' && edit.reviewer && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
                <h2 className="text-white font-bold text-lg mb-4">
                  Review Information
                </h2>
                <div className="space-y-2 text-white/80">
                  <p>
                    <strong>Reviewed by:</strong> {edit.reviewer.discordUsername}
                  </p>
                  <p>
                    <strong>Reviewed at:</strong> {edit.reviewed_at && formatDate(edit.reviewed_at)}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={edit.status === 'approved' ? 'text-green-400' : 'text-red-400'}>
                      {edit.status.charAt(0).toUpperCase() + edit.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
              <h3 className="text-white font-bold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/60">Fields Modified</p>
                  <p className="text-white font-bold text-lg">
                    {(() => {
                      let changedCount = 0;
                      for (const key in edit.edit_data) {
                        if (JSON.stringify(edit.edit_data[key]) !== JSON.stringify(edit.original_data[key])) {
                          changedCount++;
                        }
                      }
                      return changedCount;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Submission Date</p>
                  <p className="text-white">{formatDate(edit.created_at)}</p>
                </div>
                <div>
                  <p className="text-white/60">Item ID</p>
                  <p className="text-white font-mono">{edit.item_id}</p>
                </div>
              </div>
            </div>

            {/* Comment Thread */}
            <CommentThread editId={edit.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
