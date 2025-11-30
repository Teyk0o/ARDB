'use client';

/**
 * Text Autocomplete Component
 * Searchable input with suggestions based on existing values
 */

import { useState, useRef, useEffect } from 'react';

interface TextAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export default function TextAutocomplete({
  value,
  onChange,
  suggestions,
  placeholder = 'Type to search or add new...',
}: TextAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const filteredSuggestions = suggestions
    .filter(suggestion => {
      const query = inputValue.toLowerCase();
      return suggestion.toLowerCase().includes(query) && suggestion !== inputValue;
    })
    .sort((a, b) => {
      // Prioritize matches at the start
      const aStarts = a.toLowerCase().startsWith(inputValue.toLowerCase());
      const bStarts = b.toLowerCase().startsWith(inputValue.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 10); // Limit to 10 suggestions

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{
          backgroundColor: '#1a0d23',
          borderColor: '#2a1e33',
          color: '#ffffff',
        }}
        className="w-full border rounded-md px-3 py-2 focus:outline-none"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f1aa1c80')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a1e33')}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#f1aa1c')}
        onBlur={(e) => {
          setTimeout(() => (e.currentTarget.style.borderColor = '#2a1e33'), 200);
        }}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          style={{
            backgroundColor: '#1a0d23',
            borderColor: '#2a1e33',
          }}
          className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          <div className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                style={{
                  backgroundColor: '#1a0d23',
                  color: '#ffffff',
                }}
                className="w-full text-left px-3 py-2 transition-colors cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1aa1c';
                  e.currentTarget.style.color = '#130918';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a0d23';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
