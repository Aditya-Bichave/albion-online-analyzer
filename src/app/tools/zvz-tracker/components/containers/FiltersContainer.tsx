'use client';

import { useFilters } from '../../hooks/useFilters';
import ZvZFilters from '../ZvZFilters';
import type { ZvZFilters as FiltersType } from '../../types';

interface Props {
  t: (key: string) => string;
  onFiltersChange?: (filters: FiltersType) => void;
  onReset?: () => void;
}

/**
 * Container component for ZvZFilters
 * Handles filter state management
 */
export default function FiltersContainer({ t, onFiltersChange, onReset }: Props) {
  const {
    filters,
    hasActiveFilters,
    setFilters,
    updateFilter,
    resetFilters
  } = useFilters({
    onFiltersChange,
    onReset
  });

  return (
    <ZvZFilters
      filters={filters}
      onFiltersChange={setFilters}
      onReset={resetFilters}
      hasActiveFilters={hasActiveFilters}
      t={t}
    />
  );
}

/**
 * Export hook for parent component to access filter state
 */
export function useFiltersContainer() {
  return {
    Component: FiltersContainer
  };
}
