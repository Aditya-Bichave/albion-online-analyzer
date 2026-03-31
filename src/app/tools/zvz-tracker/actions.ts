'use server';

import type { BattleIntensityDistribution } from './types';

const REGION_URLS = {
  west: 'https://gameinfo.albiononline.com',
  east: 'https://gameinfo-sgp.albiononline.com',
  europe: 'https://gameinfo-ams.albiononline.com'
};

/**
 * Fetch recent battles from the official Albion GameInfo API
 * Note: This API only returns "notable" historical battles, not real-time ZvZ activity
 * For real-time data, Albion Battle Hub uses unofficial/community sources
 */
export async function getBattles(
  region: 'west' | 'east' | 'europe' = 'west',
  limit: number = 50,
  offset: number = 0,
  sort: 'totalFame' | 'totalKills' = 'totalFame'
) {
  try {
    const baseUrl = REGION_URLS[region];
    const safeLimit = Math.min(limit, 51);
    const battlesUrl = `${baseUrl}/api/gameinfo/battles?limit=${safeLimit}&offset=${offset}&sort=${sort}`;

    const response = await fetch(battlesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 60 } // Revalidate every minute for fresher data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: battlesUrl,
        errorText: errorText.substring(0, 500)
      });
      throw new Error(`Failed to fetch battles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const now = new Date();
      const firstBattle = new Date(data[0].startTime);
      const hoursAgo = (now.getTime() - firstBattle.getTime()) / (1000 * 60 * 60);
      
      console.log(`[Battles API] Fetched ${data.length} battles`);
      console.log(`[Battles API] Most recent battle: ${hoursAgo.toFixed(1)} hours ago`);
      console.log(`[Battles API] Note: Official API only shows notable historical battles, not real-time ZvZ`);
      
      // Add a flag to battles if they're old
      const battlesWithAge = data.map((battle: any) => ({
        ...battle,
        _isOld: hoursAgo > 24,
        _hoursAgo: hoursAgo
      }));
      
      return { battles: battlesWithAge, error: undefined, _isOldData: hoursAgo > 24 };
    }
    
    return { battles: [], error: undefined };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Battles fetch error:', {
      message: errorMessage,
      region,
      stack: error instanceof Error ? error.stack : undefined
    });
    return { error: 'Failed to fetch battles', battles: [] };
  }
}

export async function getBattleDetails(
  battleId: string,
  region: 'west' | 'east' | 'europe' = 'west'
) {
  try {
    const baseUrl = REGION_URLS[region];
    const response = await fetch(
      `${baseUrl}/api/gameinfo/battles/${battleId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch battle details');
    }

    const data = await response.json();
    return { battle: data, error: undefined };
  } catch (error) {
    console.error('Battle details error:', error);
    return { error: 'Failed to fetch battle details', battle: null };
  }
}

export async function searchEntities(
  query: string,
  region: 'west' | 'east' | 'europe' = 'west'
) {
  try {
    const baseUrl = REGION_URLS[region];
    const response = await fetch(
      `${baseUrl}/api/gameinfo/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    return { results: data, error: undefined };
  } catch (error) {
    console.error('Search error:', error);
    return { error: 'Failed to search', results: null };
  }
}

export async function getEntityDetails(
  type: 'guilds' | 'players' | 'alliances',
  id: string,
  region: 'west' | 'east' | 'europe' = 'west'
) {
  try {
    const baseUrl = REGION_URLS[region];
    const response = await fetch(
      `${baseUrl}/api/gameinfo/${type}/${id}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    if (!response.ok) throw new Error('Fetch details failed');

    const data = await response.json();
    return { data, error: undefined };
  } catch (error) {
    console.error('Entity details error:', error);
    return { error: 'Failed to fetch details', data: null };
  }
}

export async function getBattleEvents(
  battleId: string,
  offset: number = 0,
  limit: number = 50,
  region: 'west' | 'east' | 'europe' = 'west'
) {
  try {
    const baseUrl = REGION_URLS[region];
    // Try primary endpoint first
    try {
      const response = await fetch(
        `${baseUrl}/api/gameinfo/events/battle/${battleId}?offset=${offset}&limit=${limit}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          next: { revalidate: 30 }
        } as RequestInit
      );

      if (response.ok) {
        const events = await response.json();
        if (Array.isArray(events) && events.length > 0) {
          return { events, error: undefined };
        }
      }
    } catch (e) {
      console.warn('Primary events endpoint failed, trying fallback...');
    }

    // Fallback to query parameter endpoint
    const response = await fetch(
      `${baseUrl}/api/gameinfo/events?battleId=${battleId}&offset=${offset}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        next: { revalidate: 30 }
      } as RequestInit
    );

    if (!response.ok) throw new Error('Failed to fetch battle events');

    const events = await response.json();
    return { events, error: undefined };
  } catch (error) {
    console.error('Battle events error:', error);
    return { error: 'Failed to fetch battle events', events: [] };
  }
}

/**
 * Get battle analytics for a region with optional filters
 */
export async function getBattleAnalytics(
  region: 'west' | 'east' | 'europe' = 'west',
  filters?: {
    timeRange?: '24h' | '7d' | '30d' | 'all';
    battleStatus?: 'all' | 'live' | 'ended';
  }
) {
  try {
    // First, fetch battles
    const { battles, error } = await getBattles(region, 100);
    if (error || !battles) {
      return { analytics: null, error: error || 'Failed to fetch battles' };
    }

    // Import analytics calculations
    const { calculateBattleAnalytics } = await import('./lib/analytics');
    const { isLiveBattle, isWithinTimeRange } = await import('./utils');

    // Apply filters
    let filteredBattles = battles;

    if (filters?.timeRange && filters.timeRange !== 'all') {
      filteredBattles = filteredBattles.filter((b: any) =>
        isWithinTimeRange(b.startTime, filters.timeRange!)
      );
    }

    if (filters?.battleStatus === 'live') {
      filteredBattles = filteredBattles.filter((b: any) =>
        isLiveBattle(b.startTime)
      );
    } else if (filters?.battleStatus === 'ended') {
      filteredBattles = filteredBattles.filter(
        (b: any) => !isLiveBattle(b.startTime)
      );
    }

    // Calculate analytics
    const analytics = calculateBattleAnalytics(filteredBattles);

    return { analytics, error: undefined };
  } catch (error) {
    console.error('Battle analytics error:', error);
    return { analytics: null, error: 'Failed to calculate analytics' };
  }
}

/**
 * Get leaderboards for guilds, alliances, and players
 */
export async function getLeaderboards(
  region: 'west' | 'east' | 'europe' = 'west',
  limit: number = 100
) {
  try {
    // Fetch battles to calculate stats
    const { battles, error } = await getBattles(region, 200);
    if (error || !battles) {
      return {
        guilds: [],
        alliances: [],
        players: [],
        error: error || 'Failed to fetch battles'
      };
    }

    // Import stats calculations
    const {
      calculateGuildStats,
      calculateAllianceStats,
      calculatePlayerStats
    } = await import('./lib/analytics');

    const guilds = calculateGuildStats(battles).slice(0, limit);
    const alliances = calculateAllianceStats(battles).slice(0, limit);
    const players = calculatePlayerStats(battles).slice(0, limit);

    return { guilds, alliances, players, error: undefined };
  } catch (error) {
    console.error('Leaderboards error:', error);
    return {
      guilds: [],
      alliances: [],
      players: [],
      error: 'Failed to fetch leaderboards'
    };
  }
}

// ============================================================================
// NEW ANALYTICS SERVER ACTIONS - PHASE 2
// ============================================================================

import type { ZvZFilters } from './types';
import type { BattleStats } from './lib/battle-stats';
import type { ZoneControlStats } from './lib/zone-control';

/**
 * Get comprehensive battle stats
 */
export async function getBattleStats(
  region: 'west' | 'east' | 'europe' = 'west',
  filters?: ZvZFilters
): Promise<{ stats: BattleStats | null; error?: string }> {
  try {
    // Fetch battles
    const { battles, error } = await getBattles(region, 200);
    if (error || !battles) {
      return { stats: null, error: error || 'Failed to fetch battles' };
    }

    // Import calculations
    const { calculateBattleStats } = await import('./lib/battle-stats');
    const { applyFilters } = await import('./lib/filters');

    // Apply filters if provided
    let filteredBattles = battles;
    if (filters) {
      filteredBattles = applyFilters(battles, filters);
    }

    // Calculate stats
    const stats = calculateBattleStats(filteredBattles);

    return { stats, error: undefined };
  } catch (error) {
    console.error('Battle stats error:', error);
    return { stats: null, error: 'Failed to calculate battle stats' };
  }
}

/**
 * Get zone control data
 */
export async function getZoneControlData(
  region: 'west' | 'east' | 'europe' = 'west'
): Promise<{ zoneControl: ZoneControlStats | null; error?: string }> {
  try {
    // Fetch battles
    const { battles, error } = await getBattles(region, 200);
    if (error || !battles) {
      return { zoneControl: null, error: error || 'Failed to fetch battles' };
    }

    // Import zone control calculations
    const { trackZoneControl } = await import('./lib/zone-control');

    // Track zone control
    const zoneControl = trackZoneControl(battles);

    return { zoneControl, error: undefined };
  } catch (error) {
    console.error('Zone control error:', error);
    return { zoneControl: null, error: 'Failed to calculate zone control' };
  }
}

/**
 * Timeline entry for charts
 */
export interface TimelineEntry {
  timestamp: string;
  battles: number;
  kills: number;
  fame: number;
  participants: number;
}

/**
 * Get battle timeline data for charts
 */
export async function getBattleTimelineData(
  region: 'west' | 'east' | 'europe' = 'west',
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<{ timeline: TimelineEntry[]; error?: string }> {
  try {
    // Fetch battles with appropriate limit based on time range
    const limit = timeRange === '24h' ? 50 : timeRange === '7d' ? 200 : 500;
    const { battles, error } = await getBattles(region, limit);
    if (error || !battles) {
      return { timeline: [], error: error || 'Failed to fetch battles' };
    }

    // Import chart data transformation
    const { transformBattleTimelineData } = await import('./lib/chart-data');

    // Transform data for charts
    const timeline = transformBattleTimelineData(battles, timeRange);

    return { timeline, error: undefined };
  } catch (error) {
    console.error('Timeline data error:', error);
    return { timeline: [], error: 'Failed to generate timeline data' };
  }
}

/**
 * Get faction dominance data for charts
 */
export async function getFactionDominanceData(
  region: 'west' | 'east' | 'europe' = 'west',
  limit: number = 20
): Promise<{ dominance: any[]; error?: string }> {
  try {
    // Fetch battles
    const { battles, error } = await getBattles(region, 200);
    if (error || !battles) {
      return { dominance: [], error: error || 'Failed to fetch battles' };
    }

    // Import chart data transformation
    const { transformFactionDominanceData } = await import('./lib/chart-data');

    // Transform data
    const dominance = transformFactionDominanceData(battles).slice(0, limit);

    return { dominance, error: undefined };
  } catch (error) {
    console.error('Faction dominance error:', error);
    return { dominance: [], error: 'Failed to generate faction dominance data' };
  }
}

/**
 * Get battle intensity data for charts
 */
export async function getBattleIntensityData(
  region: 'west' | 'east' | 'europe' = 'west'
): Promise<{ intensity: BattleIntensityDistribution | null; error?: string }> {
  try {
    // Fetch battles
    const { battles, error } = await getBattles(region, 200);
    if (error || !battles) {
      return { intensity: null, error: error || 'Failed to fetch battles' };
    }

    // Import chart data transformation
    const { transformIntensityData } = await import('./lib/chart-data');

    // Transform data
    const intensity = transformIntensityData(battles);

    return { intensity, error: undefined };
  } catch (error) {
    console.error('Battle intensity error:', error);
    return { intensity: null, error: 'Failed to generate intensity data' };
  }
}

/**
 * Get comprehensive analytics dashboard data
 */
export async function getAnalyticsDashboard(
  region: 'west' | 'east' | 'europe' = 'west',
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<{
  analytics: any;
  stats: BattleStats | null;
  timeline: TimelineEntry[];
  factionDominance: any[];
  intensity: BattleIntensityDistribution | null;
  error?: string;
}> {
  try {
    // Fetch all data in parallel
    const [
      { battles: battlesData, error: battlesError },
      { timeline, error: timelineError },
      { dominance, error: dominanceError }
    ] = await Promise.all([
      getBattles(region, 200),
      getBattleTimelineData(region, timeRange),
      getFactionDominanceData(region, 20)
    ]);

    if (battlesError || !battlesData) {
      return {
        analytics: null,
        stats: null,
        timeline: [],
        factionDominance: [],
        intensity: null,
        error: battlesError || 'Failed to fetch battles'
      };
    }

    // Import calculations
    const { calculateBattleAnalytics } = await import('./lib/analytics');
    const { calculateBattleStats } = await import('./lib/battle-stats');
    const { transformIntensityData } = await import('./lib/chart-data');
    const { isWithinTimeRange } = await import('./utils');

    // Filter battles by time range
    const filteredBattles = battlesData.filter((b: any) =>
      isWithinTimeRange(b.startTime, timeRange)
    );

    // Calculate analytics
    const analytics = calculateBattleAnalytics(filteredBattles);
    const stats = calculateBattleStats(filteredBattles);
    const intensity = transformIntensityData(filteredBattles);

    return {
      analytics,
      stats,
      timeline,
      factionDominance: dominance,
      intensity,
      error: undefined
    };
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return {
      analytics: null,
      stats: null,
      timeline: [],
      factionDominance: [],
      intensity: null,
      error: 'Failed to load analytics dashboard'
    };
  }
}
