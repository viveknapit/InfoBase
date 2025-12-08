import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { AppDispatch, RootState } from '../redux/store';
import {
  setQuery,
  searchQuestions,
  fetchSuggestions,
  clearSuggestions,
  setPage,
} from '../redux/slices/SearchSlice';

const SearchBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { query, suggestions, isSuggestionsLoading, sortBy, limit } = useSelector(
    (state: RootState) => state.search
  );

  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local query with Redux query
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is too short
    if (localQuery.length < 2) {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
      return;
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      // Fetch suggestions for autocomplete
      dispatch(fetchSuggestions(localQuery));
      setShowSuggestions(true);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuery, dispatch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setSelectedSuggestionIndex(-1);
  };

  // Handle search submission
  const handleSearch = () => {
    if (localQuery.trim().length === 0) {
      return;
    }

    dispatch(setQuery(localQuery));
    dispatch(setPage(1));
    dispatch(
      searchQuestions({
        query: localQuery,
        page: 1,
        limit,
        sortBy,
      })
    );

    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(localQuery)}`);
  };

  // Handle form submit (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    dispatch(setQuery(suggestion));
    dispatch(setPage(1));
    dispatch(
      searchQuestions({
        query: suggestion,
        page: 1,
        limit,
        sortBy,
      })
    );
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setLocalQuery('');
    dispatch(setQuery(''));
    dispatch(clearSuggestions());
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          
          <input
            ref={searchInputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => localQuery.length >= 2 && setShowSuggestions(true)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-20 py-3 bg-gray-100 rounded-2xl outline-none text-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
            aria-label="Search questions"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />

          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
        >
          {isSuggestionsLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          )}

          {!isSuggestionsLoading &&
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === selectedSuggestionIndex ? 'bg-indigo-50' : ''
                }`}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions &&
        !isSuggestionsLoading &&
        suggestions.length === 0 &&
        localQuery.length >= 2 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3"
          >
            <p className="text-sm text-gray-500">No suggestions found</p>
          </div>
        )}
    </div>
  );
};

export default SearchBar;