'use client';

import { useState, useCallback, useMemo } from 'react';
import { applyFilters, getDefaultFilters } from '../lib/filters';
import type { ZvZFilters, Battle } from '../types';

interface UseFiltersOptions {
  initialFilters?: ZvZFilters;
  onFiltersChange?: (filters: ZvZFilters) => void;
  onReset?: () => void;
}

interface UseFiltersReturn {
  filters: ZvZFilters;
  hasActiveFilters: boolean;
  setFilters: (filters: ZvZFilters) => void;
  updateFilter: <K extends keyof ZvZFilters>(key: K, value: ZvZFilters[K]) => void;
  resetFilters: () => void;
  applyFiltersToBattles: (battles: Battle[]) => Battle[];
}

/**
 * Custom hook for managing filter state and application
 */
export function useFilters(
  options: UseFiltersOptions = {}
): UseFiltersReturn {
  const {
    initialFilters,
    onFiltersChange,
    onReset
  } = options;

  const [filters, setFiltersState] = useState<ZvZFilters>(() => {
    // Always initialize with fresh default filters
    const defaults = getDefaultFilters();
    return initialFilters || defaults;
  });

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: ZvZFilters) => {
    setFiltersState(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  /**
   * Update a single filter key
   */
  const updateFilter = useCallback(<K extends keyof ZvZFilters>(
    key: K,
    value: ZvZFilters[K]
  ) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, [key]: value };
      onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaults = getDefaultFilters();
    setFiltersState(defaults);
    onReset?.();
  }, [onReset]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.timeRange !== '24h' ||
      filters.battleStatus !== 'all' ||
      (filters.zoneType && filters.zoneType !== 'all') ||
      !!filters.faction ||
      (filters.minParticipants && filters.minParticipants > 0) ||
      !!filters.searchQuery
    );
  }, [filters]);

  /**
   * Apply filters to battles array
   */
  const applyFiltersToBattles = useCallback((battles: Battle[]) => {
    return applyFilters(battles, filters);
  }, [filters]);

  return {
    filters,
    hasActiveFilters,
    setFilters,
    updateFilter,
    resetFilters,
    applyFiltersToBattles
  };
}
