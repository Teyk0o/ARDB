'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Select items...',
  className = ''
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const displayText = values.length === 0
    ? placeholder
    : values.length === 1
    ? options.find(o => o.value === values[0])?.label || placeholder
    : `${values.length} selected`;

  const dropdown = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-lg shadow-2xl max-h-60 overflow-y-auto"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 99999
      }}
    >
      {options.map((option) => (
        <div
          key={option.value}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleValue(option.value);
          }}
          className="px-4 py-3 cursor-pointer transition-all font-medium flex items-center gap-2"
          style={values.includes(option.value) ? {
            backgroundColor: '#130918',
            color: '#f1aa1c'
          } : {
            backgroundColor: 'transparent',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            if (!values.includes(option.value)) {
              e.currentTarget.style.backgroundColor = '#130918';
              e.currentTarget.style.color = '#f1aa1c';
            }
          }}
          onMouseLeave={(e) => {
            if (!values.includes(option.value)) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
        >
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => {}}
            className="w-4 h-4 cursor-pointer"
            style={{
              accentColor: '#f1aa1c'
            }}
          />
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
          className="w-full rounded-lg px-4 py-3 outline-none cursor-pointer transition-all flex items-center justify-between"
          style={{
            backgroundColor: '#130918',
            border: '1px solid #2d1f38',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.borderColor = '#2d1f38';
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
          onBlur={(e) => {
            if (!isOpen) e.currentTarget.style.borderColor = '#2d1f38';
          }}
        >
          <span className={values.length === 0 ? 'text-white/40' : ''}>{displayText}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {dropdown}
    </>
  );
}
