'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchEntities, getEntityDetails } from '../actions';

interface SearchResult {
  id: string;
  type: 'guilds' | 'players' | 'alliances';
  Name?: string;
  name?: string;
  Tag?: string;
}

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
  onSuccess?: (results: SearchResult[]) => void;
  onError?: (error: string) => void;
  onEntitySelect?: (entity: any) => void;
}

interface UseSearchReturn {
  searchQuery: string;
  searchResults: SearchResult[] | null;
  isSearching: boolean;
  selectedEntity: any | null;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  selectEntity: (type: string, id: string) => Promise<void>;
  clearSelectedEntity: () => void;
}

/**
 * Custom hook for managing search with debouncing and entity selection
 */
export function useSearch(
  region: 'west' | 'east' | 'europe',
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 500,
    minLength = 3,
    onSuccess,
    onError,
    onEntitySelect
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
  }, []);

  /**
   * Select entity and load details
   */
  const selectEntity = useCallback(async (type: string, id: string) => {
    const entityType = type as 'guilds' | 'players' | 'alliances';
    setIsSearching(true);

    try {
      const { data } = await getEntityDetails(entityType, id, region);
      if (data) {
        const entity = { ...data, type: entityType };
        setSelectedEntity(entity);
        onEntitySelect?.(entity);
      } else {
        onError?.('Failed to load entity details');
      }
    } catch (err) {
      console.error('Failed to load entity details:', err);
      onError?.('Failed to load entity details');
    } finally {
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults(null);
    }
  }, [region, onEntitySelect, onError]);

  /**
   * Clear selected entity
   */
  const clearSelectedEntity = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.length >= minLength) {
        setIsSearching(true);
        try {
          const { results } = await searchEntities(searchQuery, region);
          setSearchResults(results || null);
          if (!results || results.length === 0) {
            onError?.('No search results found');
          }
          onSuccess?.(results || []);
        } catch (err) {
          console.error('Search failed:', err);
          onError?.('Search failed');
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, region, debounceMs, minLength, onSuccess, onError]);

  return {
    searchQuery,
    searchResults,
    isSearching,
    selectedEntity,
    setSearchQuery,
    clearSearch,
    selectEntity,
    clearSelectedEntity
  };
}
