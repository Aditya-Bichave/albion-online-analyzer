'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Battle } from '../types';

interface UseZvZTrackerOptions {
  battlesPerPage?: number;
}

interface UseZvZTrackerReturn {
  // Pagination
  battlesPage: number;
  battlesPerPage: number;
  setBattlesPage: (page: number) => void;
  
  // Battle counts
  newBattleCount: number;
  setNewBattleCount: (count: number) => void;
  
  // Error states
  refreshError: string | undefined;
  setRefreshError: (error: string | undefined) => void;
  
  // Helper functions
  isLiveBattle: (battle: Battle) => boolean;
  formatTimeAgo: (dateString: string) => string;
  copyBattleLink: (battleId: number, searchParams: URLSearchParams, pathname: string) => void;
  
  // Computed values
  topKills: number;
}

/**
 * Comprehensive hook for ZvZ Tracker UI state and helper functions
 */
export function useZvZTracker(
  liveBattles: Battle[],
  options: UseZvZTrackerOptions = {}
): UseZvZTrackerReturn {
  const t = useTranslations('ZvzTracker');
  const { battlesPerPage = 15 } = options;
  
  // Pagination state
  const [battlesPage, setBattlesPage] = useState(1);
  
  // Battle counts
  const [newBattleCount, setNewBattleCount] = useState(0);
  
  // Error states
  const [refreshError, setRefreshError] = useState<string | undefined>();
  
  /**
   * Check if battle is live (started within last 20 minutes)
   */
  const isLiveBattle = useCallback((battle: Battle): boolean => {
    return new Date(battle.startTime).getTime() > Date.now() - 20 * 60 * 1000;
  }, []);
  
  /**
   * Format time ago from date string
   */
  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('invalidDate') || 'Invalid date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('secondsAgo', { n: diffInSeconds });
    }
    if (diffInSeconds < 3600) {
      const m = Math.floor(diffInSeconds / 60);
      return m === 1 ? t('minuteAgo') : t('minutesAgo', { n: m });
    }
    if (diffInSeconds < 86400) {
      const h = Math.floor(diffInSeconds / 3600);
      return h === 1 ? t('hourAgo') : t('hoursAgo', { n: h });
    }
    const d = Math.floor(diffInSeconds / 86400);
    return d === 1 ? t('dayAgo') : t('daysAgo', { n: d });
  }, [t]);
  
  /**
   * Copy battle link to clipboard
   */
  const copyBattleLink = useCallback((battleId: number, searchParams: URLSearchParams, pathname: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('battleId', battleId.toString());
    const url = `${window.location.origin}${pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
  }, []);
  
  /**
   * Calculate top kills from live battles
   */
  const topKills = useMemo(() => {
    return liveBattles.length > 0
      ? Math.max(...liveBattles.map(b => b.totalKills))
      : 0;
  }, [liveBattles]);
  
  return {
    // Pagination
    battlesPage,
    battlesPerPage,
    setBattlesPage,
    
    // Battle counts
    newBattleCount,
    setNewBattleCount,
    
    // Error states
    refreshError,
    setRefreshError,
    
    // Helper functions
    isLiveBattle,
    formatTimeAgo,
    copyBattleLink,
    
    // Computed values
    topKills
  };
}
