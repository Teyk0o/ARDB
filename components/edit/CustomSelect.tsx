'use client';

/**
 * Custom Select Component
 * Styled dropdown similar to language picker
 */

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#1a0d23',
          borderColor: isOpen ? '#f1aa1c' : '#2a1e33',
          color: '#ffffff',
        }}
        className="w-full border rounded-md px-3 py-2 focus:outline-none flex items-center justify-between cursor-pointer transition-colors"
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#f1aa1c80';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#2a1e33';
        }}
      >
        <span style={{ color: selectedOption ? '#ffffff' : '#ffffff66' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown
          style={{ color: '#ffffff99' }}
          className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          style={{
            backgroundColor: '#1a0d23',
            borderColor: '#2a1e33',
          }}
          className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          <div className="py-1">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                style={{
                  backgroundColor: option.value === value ? '#f1aa1c' : '#1a0d23',
                  color: option.value === value ? '#130918' : '#ffffff',
                  fontWeight: option.value === value ? '500' : '400',
                }}
                className="w-full text-left px-3 py-2 transition-colors cursor-pointer"
                onMouseEnter={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.backgroundColor = '#f1aa1c';
                    e.currentTarget.style.color = '#130918';
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.backgroundColor = '#1a0d23';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
