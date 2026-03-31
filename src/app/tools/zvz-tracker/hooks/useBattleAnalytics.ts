'use client';

import { useState, useEffect, useMemo } from 'react';
import { calculateBattleAnalytics } from '../lib/analytics';
import { calculateBattleStats } from '../lib/battle-stats';
import { applyFilters } from '../lib/filters';
import type { Battle, ZvZFilters } from '../types';

/**
 * Check if battle is live (started within last 20 minutes)
 */
function isLiveBattle(startTime: string): boolean {
  return new Date(startTime).getTime() > Date.now() - 20 * 60 * 1000;
}

/**
 * React hook for battle analytics with memoization
 */
export function useBattleAnalytics(
  battles: Battle[],
  filters: ZvZFilters
) {
  // Memoized analytics calculations
  const analytics = useMemo(() => {
    return calculateBattleAnalytics(battles);
  }, [battles]);

  // Memoized battle stats
  const stats = useMemo(() => {
    return calculateBattleStats(battles);
  }, [battles]);

  // Memoized filtered battles
  const filteredBattles = useMemo(() => {
    return applyFilters(battles, filters);
  }, [battles, filters]);

  // Memoized live battles
  const liveBattles = useMemo(() => {
    return filteredBattles.filter((b) => isLiveBattle(b.startTime));
  }, [filteredBattles]);

  // Memoized past battles
  const pastBattles = useMemo(() => {
    return filteredBattles.filter((b) => !isLiveBattle(b.startTime));
  }, [filteredBattles]);

  // Memoized battle count
  const battleCount = useMemo(() => {
    return filteredBattles.length;
  }, [filteredBattles]);

  // Memoized faction distribution
  const factionDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    filteredBattles.forEach((battle) => {
      Object.values(battle.guilds || {}).forEach((guild: any) => {
        if (!distribution[guild.name]) {
          distribution[guild.name] = 0;
        }
        distribution[guild.name] += 1;
      });

      Object.values(battle.alliances || {}).forEach((alliance: any) => {
        if (!distribution[alliance.name]) {
          distribution[alliance.name] = 0;
        }
        distribution[alliance.name] += 1;
      });
    });

    return distribution;
  }, [filteredBattles]);

  // Memoized intensity distribution
  const intensityDistribution = useMemo(() => {
    return stats.intensityDistribution;
  }, [stats]);

  // Memoized zone type distribution
  const zoneTypeDistribution = useMemo(() => {
    return stats.zoneTypeDistribution;
  }, [stats]);

  return {
    // Core analytics
    analytics,
    stats,

    // Filtered data
    filteredBattles,
    battleCount,

    // Battle status
    liveBattles,
    pastBattles,

    // Distributions
    factionDistribution,
    intensityDistribution,
    zoneTypeDistribution,

    // Derived metrics
    liveBattleCount: liveBattles.length,
    pastBattleCount: pastBattles.length,
    avgKillsPerBattle: stats.avgKillsPerBattle,
    avgFamePerBattle: stats.avgFamePerBattle,
    totalKills: stats.totalKills,
    totalFame: stats.totalFame
  };
}

/**
 * Hook for real-time analytics updates
 */
export function useRealTimeAnalytics(
  battles: Battle[],
  filters: ZvZFilters,
  refreshInterval: number = 30000 // 30 seconds
) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const analytics = useBattleAnalytics(battles, filters);

  // Auto-update lastUpdated timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    ...analytics,
    lastUpdated,
    isStale: Date.now() - lastUpdated.getTime() > refreshInterval
  };
}

/**
 * Hook for filtered battle search
 */
export function useBattleSearch(
  battles: Battle[],
  query: string
) {
  const [searchResults, setSearchResults] = useState<Battle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(battles);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timeout = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results = battles.filter((battle) => {
        // Search by battle ID
        if (battle.id.toString().includes(lowerQuery)) {
          return true;
        }

        // Search by cluster name
        if (battle.clusterName.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search by guilds
        if (
          Object.values(battle.guilds || {}).some((g: any) =>
            g.name.toLowerCase().includes(lowerQuery)
          )
        ) {
          return true;
        }

        // Search by alliances
        if (
          Object.values(battle.alliances || {}).some((a: any) =>
            a.name.toLowerCase().includes(lowerQuery)
          )
        ) {
          return true;
        }

        // Search by players
        if (
          Object.values(battle.players || {}).some((p: any) =>
            p.name.toLowerCase().includes(lowerQuery)
          )
        ) {
          return true;
        }

        return false;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [battles, query]);

  return {
    searchResults,
    isSearching,
    resultCount: searchResults.length
  };
}

/**
 * Hook for battle comparison
 */
export function useBattleComparison(
  battles1: Battle[],
  battles2: Battle[]
) {
  const stats1 = useMemo(() => {
    return calculateBattleStats(battles1);
  }, [battles1]);

  const stats2 = useMemo(() => {
    return calculateBattleStats(battles2);
  }, [battles2]);

  const comparison = useMemo(() => {
    return {
      totalBattlesChange: stats2.totalBattles - stats1.totalBattles,
      totalBattlesChangePercent: stats1.totalBattles > 0
        ? Math.round((stats2.totalBattles - stats1.totalBattles) / stats1.totalBattles * 100)
        : 0,

      avgKillsChange: stats2.avgKillsPerBattle - stats1.avgKillsPerBattle,
      avgKillsChangePercent: stats1.avgKillsPerBattle > 0
        ? Math.round((stats2.avgKillsPerBattle - stats1.avgKillsPerBattle) / stats1.avgKillsPerBattle * 100)
        : 0,

      avgFameChange: stats2.avgFamePerBattle - stats1.avgFamePerBattle,
      avgFameChangePercent: stats1.avgFamePerBattle > 0
        ? Math.round((stats2.avgFamePerBattle - stats1.avgFamePerBattle) / stats1.avgFamePerBattle * 100)
        : 0,

      intensityShift: {
        low: stats2.intensityDistribution.low - stats1.intensityDistribution.low,
        medium: stats2.intensityDistribution.medium - stats1.intensityDistribution.medium,
        high: stats2.intensityDistribution.high - stats1.intensityDistribution.high,
        extreme: stats2.intensityDistribution.extreme - stats1.intensityDistribution.extreme
      }
    };
  }, [stats1, stats2]);

  return {
    stats1,
    stats2,
    comparison
  };
}
