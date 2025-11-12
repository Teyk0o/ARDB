'use client';

import { useState, useEffect } from 'react';

export default function ContributionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('contribution-banner-dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('contribution-banner-dismissed', 'true');
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 shadow-2xl z-40"
      style={{ backgroundColor: '#f1aa1c' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold mb-1" style={{ color: '#130918' }}>Help Arc Raiders Database Grow</h3>
            <p className="text-sm" style={{ color: 'rgba(19, 9, 24, 0.8)' }}>
              Contribute code on GitHub or help translate to other languages on Crowdin
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap border-2"
              style={{
                backgroundColor: '#130918',
                borderColor: '#130918',
                color: '#f1aa1c'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#130918')}
            >
              GitHub
            </a>
            <a
              href="https://crowdin.com/project/ardb"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap border-2"
              style={{
                backgroundColor: '#130918',
                borderColor: '#130918',
                color: '#f1aa1c'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#130918')}
            >
              Crowdin
            </a>
            <button
              onClick={handleDismiss}
              className="font-bold py-2 px-4 rounded transition-colors text-sm border-2 cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#130918',
                color: '#130918'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Dismiss banner"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
