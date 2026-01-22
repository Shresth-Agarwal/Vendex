'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchAutocompleteProps {
  items: Array<{ id: string; name: string; [key: string]: any }>;
  onSelect: (item: any) => void;
  placeholder?: string;
  searchKeys?: string[];
  renderItem?: (item: any) => React.ReactNode;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  items,
  onSelect,
  placeholder = 'Search...',
  searchKeys = ['name'],
  renderItem,
}) => {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const filtered = items.filter((item) =>
        searchKeys.some((key) =>
          item[key]?.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredItems(filtered.slice(0, 10)); // Limit to 10 results
      setShowSuggestions(true);
    } else {
      setFilteredItems([]);
      setShowSuggestions(false);
    }
  }, [query, items, searchKeys]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    setQuery('');
    setShowSuggestions(false);
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
          className="input-field pl-10"
        />
      </div>

      {showSuggestions && filteredItems.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredItems.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
            >
              {renderItem ? (
                renderItem(item)
              ) : (
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
