'use client';

import { useState, useEffect, useRef } from 'react';
import { Language, getTranslation } from '@/lib/translations';

interface SearchWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHistory?: number;
  language: Language;
}

export default function SearchWithHistory({
  value,
  onChange,
  placeholder = 'Search...',
  maxHistory = 5,
  language
}: SearchWithHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-search-history');
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load search history:', error);
        }
      }
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save search to history when user presses Enter or clicks away
  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) return;

    const trimmed = searchTerm.trim();
    const newHistory = [
      trimmed,
      ...searchHistory.filter(item => item !== trimmed)
    ].slice(0, maxHistory);

    setSearchHistory(newHistory);
    localStorage.setItem('arc-db-search-history', JSON.stringify(newHistory));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveToHistory(value);
      setShowDropdown(false);
    }
  };

  const handleHistoryClick = (searchTerm: string) => {
    onChange(searchTerm);
    setShowDropdown(false);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('arc-db-search-history');
    setShowDropdown(false);
  };

  const handleInputBlur = () => {
    // Save to history when user clicks away
    if (value.trim()) {
      saveToHistory(value);
    }
  };

  return (
    <div className="flex-1 relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(searchHistory.length > 0)}
        onBlur={handleInputBlur}
        className="w-full bg-arc-blue border-2 border-arc-blue-lighter focus:border-arc-yellow rounded-lg px-4 py-3 pr-10 text-arc-white placeholder-arc-white/40 outline-none transition-colors"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-arc-white/60 hover:text-arc-yellow transition-colors cursor-pointer z-10"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

      {/* Search History Dropdown */}
      {showDropdown && searchHistory.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl overflow-hidden z-50"
          style={{ backgroundColor: '#130918', border: '2px solid #1a1120' }}
        >
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #1a1120' }}>
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.recentSearches}</span>
            <button
              onClick={handleClearHistory}
              className="text-xs transition-colors cursor-pointer"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
              {t.clearAll}
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {searchHistory.map((searchTerm, index) => (
              <li
                key={index}
                onClick={() => handleHistoryClick(searchTerm)}
                className="px-4 py-3 transition-colors cursor-pointer flex items-center gap-2"
                style={{
                  color: '#ffffff',
                  borderBottom: index < searchHistory.length - 1 ? '1px solid rgba(26, 17, 32, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1120'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg
                  className="w-4 h-4 text-arc-white/40 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="flex-1">{searchTerm}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
