/**
 * Language Picker Component
 * Simple text-based language selector matching navigation link style
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Language } from '@/lib/translations';

interface LanguagePickerProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'en' as Language, label: '🇬🇧 English' },
  { value: 'fr' as Language, label: '🇫🇷 Français' },
  { value: 'es' as Language, label: '🇪🇸 Español' },
  { value: 'de' as Language, label: '🇩🇪 Deutsch' },
  { value: 'zh-CN' as Language, label: '🇨🇳 简体中文' },
];

export default function LanguagePicker({ language, setLanguage }: LanguagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedOption = LANGUAGE_OPTIONS.find(opt => opt.value === language);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opening
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Update position on scroll and open
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();

      const handleScroll = () => {
        updateDropdownPosition();
      };

      const handleResize = () => {
        updateDropdownPosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const dropdown = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      className="absolute rounded-lg shadow-2xl"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38',
        top: `${dropdownPosition.top + 4}px`,
        left: `${dropdownPosition.left}px`,
        minWidth: '180px',
        zIndex: 99999
      }}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <div
          key={option.value}
          onMouseDown={(e) => {
            e.preventDefault();
            setLanguage(option.value);
            setIsOpen(false);
          }}
          className="px-4 py-2 cursor-pointer transition-all text-sm"
          style={{
            backgroundColor: option.value === language ? '#130918' : 'transparent',
            color: option.value === language ? '#f1aa1c' : '#ffffff'
          }}
          onMouseEnter={(e) => {
            if (option.value !== language) {
              e.currentTarget.style.backgroundColor = '#130918';
              e.currentTarget.style.color = '#f1aa1c';
            }
          }}
          onMouseLeave={(e) => {
            if (option.value !== language) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
        >
          {option.label}
        </div>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm sm:text-base font-medium transition-colors cursor-pointer"
        style={{ color: '#ffffff' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
      >
        {selectedOption?.label || '🇬🇧 English'}
      </button>
      {dropdown}
    </>
  );
}
