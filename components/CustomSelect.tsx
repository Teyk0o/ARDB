'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export default function CustomSelect({ value, onChange, options, className = '', placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opening or scrolling
  const updateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
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
      className="absolute rounded-lg shadow-2xl max-h-80 overflow-y-auto"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38',
        top: `${dropdownPosition.top + 4}px`,
        left: `${dropdownPosition.left}px`,
        minWidth: '200px',
        zIndex: 99999
      }}
    >
      {options.map((option) => (
        <div
          key={option.value}
          onMouseDown={(e) => {
            e.preventDefault();
            onChange(option.value);
            setIsOpen(false);
          }}
          className="px-4 py-2 cursor-pointer transition-all"
          style={{
            backgroundColor: option.value === value ? '#130918' : 'transparent',
            color: option.value === value ? '#f1aa1c' : '#ffffff'
          }}
          onMouseEnter={(e) => {
            if (option.value !== value) {
              e.currentTarget.style.backgroundColor = '#130918';
              e.currentTarget.style.color = '#f1aa1c';
            }
          }}
          onMouseLeave={(e) => {
            if (option.value !== value) {
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
      <div ref={selectRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all flex items-center gap-2 font-medium"
          style={{
            backgroundColor: '#130918',
            border: `2px solid ${isOpen ? '#f1aa1c' : '#2d1f38'}`,
            color: '#ffffff'
          }}
          onMouseEnter={(e) => !isOpen && (e.currentTarget.style.borderColor = '#f1aa1c')}
          onMouseLeave={(e) => !isOpen && (e.currentTarget.style.borderColor = '#2d1f38')}
        >
          <span className={!selectedOption ? 'text-white/30' : ''}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
          <svg
            className="w-4 h-4 transition-transform ml-auto"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {dropdown}
    </>
  );
}
