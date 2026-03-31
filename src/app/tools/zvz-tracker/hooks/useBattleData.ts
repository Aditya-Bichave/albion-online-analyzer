'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBattles } from '../actions';
import type { Battle } from '../types';

interface UseBattleDataOptions {
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onSuccess?: (battles: Battle[]) => void;
  onError?: (error: string) => void;
}

interface UseBattleDataReturn {
  battles: Battle[];
  loading: boolean;
  error: string | undefined;
  loadBattles: (isBackground?: boolean) => Promise<void>;
  refreshBattles: () => Promise<void>;
  lastRefresh: number;
}

/**
 * Custom hook for managing battle data fetching and refresh logic
 */
export function useBattleData(
  region: 'west' | 'east' | 'europe',
  options: UseBattleDataOptions = {}
): UseBattleDataReturn {
  const {
    enabled = true,
    autoRefresh = false,
    refreshInterval = 30000,
    onSuccess,
    onError
  } = options;

  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  /**
   * Load battles from API
   */
  const loadBattles = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(undefined);
    }

    try {
      const { battles: fetchedBattles, error: apiError } = await getBattles(region, 100);
      
      if (apiError) {
        setError(apiError);
        onError?.(apiError);
      } else if (fetchedBattles) {
        const sortedBattles = fetchedBattles.sort((a: Battle, b: Battle) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setBattles(sortedBattles);
        setLastRefresh(Date.now());
        
        if (!isBackground && sortedBattles.length > 0) {
          onSuccess?.(sortedBattles);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load battles';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [region, onSuccess, onError]);

  /**
   * Refresh battles (background refresh)
   */
  const refreshBattles = useCallback(async () => {
    await loadBattles(true);
  }, [loadBattles]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (enabled) {
      loadBattles(false);
    }
  }, [region, enabled]); // Reload when region changes

  /**
   * Auto-refresh logic
   */
  useEffect(() => {
    if (!enabled || !autoRefresh) return;

    const intervalId = setInterval(refreshBattles, refreshInterval);
    return () => clearInterval(intervalId);
  }, [enabled, autoRefresh, refreshInterval, refreshBattles]);

  return {
    battles,
    loading,
    error,
    loadBattles,
    refreshBattles,
    lastRefresh
  };
}
