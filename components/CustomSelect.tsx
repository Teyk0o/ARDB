'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function CustomSelect({ value, onChange, options, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const dropdown = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-lg shadow-2xl max-h-60 overflow-y-auto"
      style={{
        backgroundColor: '#130918',
        border: '2px solid rgba(241, 170, 28, 0.5)',
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
            onChange(option.value);
            setIsOpen(false);
          }}
          className="px-4 py-3 cursor-pointer transition-all text-arc-white hover:bg-arc-yellow hover:text-arc-blue font-medium"
          style={option.value === value ? { backgroundColor: '#1a1120' } : { backgroundColor: '#130918' }}
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
          className="w-full bg-arc-blue border-2 border-arc-blue-lighter focus:border-arc-yellow rounded-lg px-4 py-3 text-arc-white outline-none cursor-pointer transition-colors hover:border-arc-yellow/50 flex items-center justify-between"
        >
          <span>{selectedOption?.label}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
