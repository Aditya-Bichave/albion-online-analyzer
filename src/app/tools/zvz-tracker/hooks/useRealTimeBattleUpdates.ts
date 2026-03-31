'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Battle } from '../types';

interface Options {
  enabled: boolean;
  interval?: number;
  onRefresh?: (newBattles: Battle[]) => void;
  onError?: (error: string) => void;
}

export function useRealTimeBattleUpdates(
  region: 'west' | 'east' | 'europe',
  battles: Battle[],
  setBattles: (battles: Battle[]) => void,
  options: Options = { enabled: true }
) {
  const { 
    enabled = true, 
    interval = 30000, 
    onRefresh,
    onError 
  } = options;
  
  const lastRefreshRef = useRef<number>(Date.now());
  const hasLiveBattles = battles.some(b => 
    new Date(b.startTime).getTime() > Date.now() - 20 * 60 * 1000
  );

  const refreshBattles = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const { getBattles } = await import('../actions');
      const { battles: newBattles, error } = await getBattles(region, 100);
      
      if (error) {
        onError?.(error);
        return;
      }
      
      if (newBattles) {
        const sortedBattles = newBattles.sort((a: Battle, b: Battle) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        
        // Detect new battles
        const existingIds = new Set(battles.map(b => b.id));
        const newBattleCount = sortedBattles.filter((b: Battle) => !existingIds.has(b.id)).length;
        
        setBattles(sortedBattles);
        onRefresh?.(sortedBattles);
        
        if (newBattleCount > 0) {
          console.log(`🆕 ${newBattleCount} new battle(s) detected`);
        }
      }
      
      lastRefreshRef.current = Date.now();
    } catch (err) {
      console.error('Real-time refresh failed:', err);
      onError?.('Failed to refresh battles');
    }
  }, [region, enabled, setBattles, onRefresh, onError, battles]);

  useEffect(() => {
    if (!enabled || !hasLiveBattles) return;

    // Initial refresh after 5 seconds
    const initialTimeout = setTimeout(() => {
      refreshBattles();
    }, 5000);

    // Regular interval refresh
    const intervalId = setInterval(refreshBattles, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [enabled, hasLiveBattles, interval, refreshBattles]);

  return {
    lastRefresh: lastRefreshRef.current,
    hasLiveBattles,
    refreshNow: refreshBattles
  };
}
