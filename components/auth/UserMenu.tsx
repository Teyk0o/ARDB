'use client';

/**
 * User Menu Component
 * Shows user avatar, username, and dropdown menu
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaUser, FaSignOutAlt, FaCog, FaHistory } from 'react-icons/fa';
import Link from 'next/link';
import { getTranslation, type Language } from '@/lib/translations';

interface User {
  id: number;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  isModerator: boolean;
}

interface UserMenuProps {
  user: User;
  language?: Language;
}

export default function UserMenu({ user, language = 'en' }: UserMenuProps) {
  const t = getTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 224, // 224px = w-56 width
      });
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (response.ok) {
        // Trigger auth refresh event to update UI
        window.dispatchEvent(new Event('authRefresh'));

        // Navigate to home page without hard refresh
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const avatarUrl = user.discordAvatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discordId) % 5}.png`;

  const dropdown = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-56 rounded-lg shadow-lg"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 99999,
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #2d1f38' }}>
        <p className="text-white font-medium">{user.discordUsername}</p>
        <p className="text-white/60 text-sm">
          {user.isModerator ? t.moderator : t.contributor}
        </p>
      </div>

      <div className="py-1">
        <Link
          href={`/profile/${user.discordId}`}
          className="flex items-center gap-2 px-4 py-2 transition-colors cursor-pointer"
          style={{ backgroundColor: 'transparent', color: '#ffffff' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#130918';
            e.currentTarget.style.color = '#f1aa1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffffff';
          }}
          onClick={() => setIsOpen(false)}
        >
          <FaUser />
          <span>{t.myProfile}</span>
        </Link>

        <Link
          href="/contributions"
          className="flex items-center gap-2 px-4 py-2 transition-colors cursor-pointer"
          style={{ backgroundColor: 'transparent', color: '#ffffff' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#130918';
            e.currentTarget.style.color = '#f1aa1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffffff';
          }}
          onClick={() => setIsOpen(false)}
        >
          <FaHistory />
          <span>{t.myContributions}</span>
        </Link>

        {user.isModerator && (
          <Link
            href="/moderation"
            className="flex items-center gap-2 px-4 py-2 transition-colors cursor-pointer"
            style={{ backgroundColor: 'transparent', color: '#ffffff' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#130918';
              e.currentTarget.style.color = '#f1aa1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ffffff';
            }}
            onClick={() => setIsOpen(false)}
          >
            <FaCog />
            <span>{t.moderation}</span>
          </Link>
        )}
      </div>

      <div className="py-1" style={{ borderTop: '1px solid #2d1f38' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 transition-colors text-left cursor-pointer"
          style={{ backgroundColor: 'transparent', color: '#ffffff' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#130918';
            e.currentTarget.style.color = '#f1aa1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <FaSignOutAlt />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer"
        style={{ color: '#ffffff' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(45, 31, 56, 0.5)';
          e.currentTarget.style.color = '#f1aa1c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        <img
          src={avatarUrl}
          alt={user.discordUsername}
          className="w-8 h-8 rounded-full"
        />
        <span className="font-medium hidden md:block">
          {user.discordUsername}
        </span>
        {user.isModerator && (
          <span
            className="px-2 py-0.5 rounded text-xs font-bold hidden md:block"
            style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
          >
            MOD
          </span>
        )}
      </button>
      {dropdown}
    </>
  );
}
