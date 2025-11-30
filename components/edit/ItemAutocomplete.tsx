'use client';

/**
 * Item Autocomplete Component
 * Searchable dropdown for selecting items
 */

import { useState, useRef, useEffect } from 'react';
import type { Item } from '@/types/item';

interface ItemAutocompleteProps {
  items: Item[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
}

export default function ItemAutocomplete({
  items,
  value,
  onChange,
  placeholder = 'Search for an item...',
}: ItemAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected item name when value changes
  useEffect(() => {
    if (value) {
      const selectedItem = items.find(i => i.id === value);
      setSelectedItemName(selectedItem ? selectedItem.name : '');
    } else {
      setSelectedItemName('');
      setSearchQuery('');
    }
  }, [value, items]);

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

  const filteredItems = items
    .filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 50); // Limit to 50 results

  const handleSelect = (item: Item) => {
    onChange(item.id);
    setSelectedItemName(item.name);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={isOpen ? searchQuery : selectedItemName}
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

      {isOpen && (
        <div
          style={{
            backgroundColor: '#1a0d23',
            borderColor: '#2a1e33',
          }}
          className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredItems.length > 0 ? (
            <div className="py-1">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
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
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-60">{item.id}</div>
                </button>
              ))}
            </div>
          ) : (
            <div
              style={{ color: '#ffffff99' }}
              className="px-3 py-4 text-center text-sm"
            >
              {searchQuery ? 'No items found' : 'Start typing to search...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
