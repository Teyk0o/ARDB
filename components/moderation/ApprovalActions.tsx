'use client';

/**
 * Approval Actions Component
 * Approve/Reject buttons for moderators
 */

import { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
}

export default function ApprovalActions({ onApprove, onReject, loading }: ApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    onReject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
      <h2 className="text-white font-bold text-lg mb-4">Review Actions</h2>

      {!showRejectDialog ? (
        <div className="flex gap-4">
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            style={{ backgroundColor: '#16a34a' }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }
            }}
          >
            <FaCheck />
            <span>{loading ? 'Processing...' : 'Approve'}</span>
          </button>

          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            style={{ backgroundColor: '#dc2626' }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
          >
            <FaTimes />
            <span>Reject</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this edit is being rejected..."
              rows={4}
              className="w-full rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none transition-all"
              style={{ backgroundColor: '#130918', border: '2px solid #2d1f38' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
              autoFocus
            />
            <p className="text-white/60 text-sm mt-2">
              The contributor will see this reason. Be clear and constructive.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              style={{ backgroundColor: '#dc2626' }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }
              }}
            >
              <FaTimes />
              <span>{loading ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>

            <button
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={loading}
              className="flex-1 px-6 py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              style={{ backgroundColor: '#2d1f38' }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#3d2f48';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2d1f38';
                }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6" style={{ borderTop: '1px solid #2d1f38' }}>
        <h3 className="text-white font-bold mb-2">Important</h3>
        <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
          <li>Approved edits are published immediately</li>
          <li>Rejected edits cannot be recovered</li>
          <li>Contributors will receive a notification</li>
          <li>All actions are logged in the audit trail</li>
        </ul>
      </div>
    </div>
  );
}
