'use client';

/**
 * Edit List Component
 * Displays list of edit proposals with quick actions
 */

import Link from 'next/link';
import { FaEye, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from '@/lib/dateUtils';

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

interface EditListProps {
  edits: EditProposal[];
  loading: boolean;
  onRefresh: () => void;
}

export default function EditList({ edits, loading, onRefresh }: EditListProps) {
  if (loading && edits.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120' }}>
        <div className="animate-spin w-12 h-12 rounded-full mx-auto mb-4" style={{ border: '4px solid #f1aa1c', borderTopColor: 'transparent' }}></div>
        <p className="text-white/60">Loading edits...</p>
      </div>
    );
  }

  if (edits.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120' }}>
        <p className="text-white/60 text-lg mb-2">No edits found</p>
        <p className="text-white/40 text-sm">
          There are no edit proposals matching your current filter.
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'approved':
        return <FaCheck className="text-green-400" />;
      case 'rejected':
        return <FaTimes className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50';
      case 'approved':
        return 'bg-green-900/30 text-green-300 border-green-500/50';
      case 'rejected':
        return 'bg-red-900/30 text-red-300 border-red-500/50';
      default:
        return 'bg-arc-blue-lighter text-arc-white border-arc-blue-lighter';
    }
  };

  const getItemName = (edit: EditProposal) => {
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

  return (
    <div className="space-y-4">
      {edits.map((edit) => {
        const itemName = getItemName(edit);
        const avatar = edit.user?.discordAvatar
          ? `https://cdn.discordapp.com/avatars/${edit.user.discordId}/${edit.user.discordAvatar}.png?size=64`
          : edit.user?.discordId
          ? `https://cdn.discordapp.com/embed/avatars/${parseInt(edit.user.discordId) % 5}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`;

        return (
          <div
            key={edit.id}
            className="rounded-lg p-6 transition-all"
            style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(241, 170, 28, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2d1f38';
            }}
          >
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              {edit.user && (
                <img
                  src={avatar}
                  alt={edit.user.discordUsername}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {itemName}
                    </h3>
                    <p className="text-white/60 text-sm">
                      ID: {edit.item_id}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium whitespace-nowrap ${getStatusBadge(
                      edit.status
                    )}`}
                  >
                    {getStatusIcon(edit.status)}
                    {edit.status.charAt(0).toUpperCase() + edit.status.slice(1)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                  <span>
                    By <strong className="text-white">{edit.user?.discordUsername || 'Unknown'}</strong>
                  </span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(edit.created_at))}</span>
                  {edit.reviewed_at && edit.reviewer && (
                    <>
                      <span>•</span>
                      <span>
                        Reviewed by <strong className="text-white">{edit.reviewer.discordUsername}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Reason */}
                {edit.reason && (
                  <p className="text-white/80 text-sm mb-4 italic">
                    "{edit.reason}"
                  </p>
                )}

                {/* Changed Fields Count */}
                <p className="text-white/60 text-sm mb-4">
                  {(() => {
                    let changedCount = 0;
                    for (const key in edit.edit_data) {
                      if (JSON.stringify(edit.edit_data[key]) !== JSON.stringify(edit.original_data[key])) {
                        changedCount++;
                      }
                    }
                    return changedCount;
                  })()} field(s) modified
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/moderation/edit/${edit.id}`}
                    className="flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all text-sm cursor-pointer"
                    style={{
                      backgroundColor: '#f1aa1c',
                      color: '#130918'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d99a19';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1aa1c';
                    }}
                  >
                    <FaEye />
                    <span>Review</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
