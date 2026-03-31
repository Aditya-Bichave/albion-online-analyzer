'use client';

import type { ZvZFilters, Battle } from '../types';
import { isWithinTimeRange, isLiveBattle, detectZoneType } from '../utils';

/**
 * Get default filters
 */
export function getDefaultFilters(): ZvZFilters {
  return {
    timeRange: '7d',
    battleStatus: 'all',
    zoneType: 'all',
    minParticipants: 0,
    searchQuery: '',
    faction: undefined
  };
}

/**
 * Parse filters from URL params
 */
export function paramsToFilters(params: URLSearchParams): ZvZFilters {
  const filters = getDefaultFilters();

  const timeRange = params.get('timeRange');
  if (timeRange && ['24h', '7d', '30d', 'all'].includes(timeRange)) {
    filters.timeRange = timeRange as '24h' | '7d' | '30d' | 'all';
  }

  const battleStatus = params.get('battleStatus');
  if (battleStatus && ['all', 'live', 'ended'].includes(battleStatus)) {
    filters.battleStatus = battleStatus as 'all' | 'live' | 'ended';
  }

  const zoneType = params.get('zoneType');
  if (zoneType && ['all', 'crystal_tower', 'territory', 'open_world'].includes(zoneType)) {
    filters.zoneType = zoneType as 'all' | 'crystal_tower' | 'territory' | 'open_world';
  }

  const minParticipants = params.get('minParticipants');
  if (minParticipants) {
    filters.minParticipants = parseInt(minParticipants, 10);
  }

  const searchQuery = params.get('searchQuery');
  if (searchQuery) {
    filters.searchQuery = searchQuery;
  }

  const faction = params.get('faction');
  if (faction) {
    filters.faction = faction;
  }

  return filters;
}

/**
 * Convert filters to URL params
 */
export function filtersToParams(filters: ZvZFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.timeRange !== '24h') {
    params.set('timeRange', filters.timeRange);
  }

  if (filters.battleStatus !== 'all') {
    params.set('battleStatus', filters.battleStatus);
  }

  if (filters.zoneType && filters.zoneType !== 'all') {
    params.set('zoneType', filters.zoneType);
  }

  if (filters.faction) {
    params.set('faction', filters.faction);
  }

  if (filters.minParticipants && filters.minParticipants > 0) {
    params.set('minParticipants', filters.minParticipants.toString());
  }

  if (filters.searchQuery) {
    params.set('searchQuery', filters.searchQuery);
  }

  return params;
}

/**
 * Check if filters have any active values
 */
export function hasActiveFilters(filters: ZvZFilters): boolean {
  return (
    filters.timeRange !== '24h' ||
    filters.battleStatus !== 'all' ||
    (filters.zoneType && filters.zoneType !== 'all') ||
    !!filters.faction ||
    (filters.minParticipants && filters.minParticipants > 0) ||
    !!filters.searchQuery
  );
}

/**
 * Apply filters to battles array
 */
export function applyFilters(battles: Battle[], filters: ZvZFilters): Battle[] {
  return battles.filter((battle) => {
    // Time range filter
    if (!isWithinTimeRange(battle.startTime, filters.timeRange)) {
      return false;
    }

    // Battle status filter
    const isLive = isLiveBattle(battle.startTime);
    if (filters.battleStatus === 'live' && !isLive) {
      return false;
    }
    if (filters.battleStatus === 'ended' && isLive) {
      return false;
    }

    // Zone type filter
    if (filters.zoneType && filters.zoneType !== 'all') {
      const zoneType = detectZoneType(battle.clusterName);
      if (zoneType !== filters.zoneType) {
        return false;
      }
    }

    // Minimum participants filter
    if (filters.minParticipants && filters.minParticipants > 0) {
      const playerCount = Object.keys(battle.players || {}).length;
      if (playerCount < filters.minParticipants) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      
      // Search by battle ID
      if (battle.id.toString().includes(query)) return true;

      // Search by Guilds
      if (
        Object.values(battle.guilds || {}).some((g: any) =>
          g.name.toLowerCase().includes(query) ||
          (g.allianceName && g.allianceName.toLowerCase().includes(query))
        )
      ) {
        return true;
      }

      // Search by Alliances
      if (
        Object.values(battle.alliances || {}).some((a: any) =>
          a.name.toLowerCase().includes(query)
        )
      ) {
        return true;
      }

      // Search by Players
      if (
        Object.values(battle.players || {}).some((p: any) =>
          p.name.toLowerCase().includes(query) ||
          (p.guildName && p.guildName.toLowerCase().includes(query))
        )
      ) {
        return true;
      }

      return false;
    }

    return true;
  });
}
