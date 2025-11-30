'use client';

/**
 * Discord Login Button Component
 * Redirects user to Discord OAuth flow
 */

import { FaDiscord } from 'react-icons/fa';

interface DiscordLoginButtonProps {
  returnTo?: string;
  className?: string;
}

export default function DiscordLoginButton({
  returnTo,
  className = '',
}: DiscordLoginButtonProps) {
  const handleLogin = () => {
    const params = new URLSearchParams();
    if (returnTo) {
      params.append('returnTo', returnTo);
    }

    window.location.href = `/api/auth/discord?${params.toString()}`;
  };

  return (
    <button
      onClick={handleLogin}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${className}`}
      style={{
        backgroundColor: 'rgba(88, 101, 242, 0.15)',
        border: '1px solid rgba(88, 101, 242, 0.4)',
        color: '#5865F2'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(88, 101, 242, 0.25)';
        e.currentTarget.style.borderColor = '#5865F2';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(88, 101, 242, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(88, 101, 242, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.4)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <FaDiscord className="text-xl" />
      <span>Login with Discord</span>
    </button>
  );
}
