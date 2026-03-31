'use client';

import { useSearch } from '../../hooks/useSearch';
import SearchSection from '../SearchSection';

interface Props {
  region: 'west' | 'east' | 'europe';
  t: (key: string) => string;
  onEntitySelect?: (entity: any) => void;
}

/**
 * Container component for SearchSection
 * Handles search debouncing and API calls
 */
export default function SearchContainer({ region, t, onEntitySelect }: Props) {
  const {
    searchQuery,
    searchResults,
    isSearching,
    selectedEntity,
    setSearchQuery,
    clearSelectedEntity
  } = useSearch(region, {
    onEntitySelect,
    onError: (error) => {
      console.warn('Search error:', error);
    }
  });

  return (
    <SearchSection
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchResults={searchResults}
      onEntityClick={selectEntity}
      isSearching={isSearching}
      t={t}
      selectedEntity={selectedEntity}
      onCloseEntityProfile={clearSelectedEntity}
      region={region}
    />
  );

  function selectEntity(type: string, id: string) {
    // Wrapper for onEntityClick
  }
}

/**
 * Export hook for parent component to access search state
 */
export function useSearchContainer() {
  return {
    Component: SearchContainer
  };
}
