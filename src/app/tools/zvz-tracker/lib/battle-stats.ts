import type { Battle } from '../types';
import { classifyBattleIntensity, estimateBattleDuration } from './analytics';

/**
 * Battle Statistics Interface
 */
export interface BattleStats {
  totalBattles: number;
  liveBattles: number;
  endedBattles: number;
  avgKillsPerBattle: number;
  avgFamePerBattle: number;
  avgParticipantsPerBattle: number;
  avgDurationMinutes: number;
  killsPerMinute: number;
  totalKills: number;
  totalFame: number;
  totalParticipants: number;
  intensityDistribution: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
  };
  factionDistribution: Record<string, number>;
  zoneTypeDistribution: {
    crystal_tower: number;
    territory: number;
    open_world: number;
  };
  avgBattleDurationMinutes: number;
}

/**
 * Battle Stats Comparison
 */
export interface BattleStatsComparison {
  totalBattlesChange: number;
  totalBattlesChangePercent: number;
  avgKillsChange: number;
  avgKillsChangePercent: number;
  avgFameChange: number;
  avgFameChangePercent: number;
  intensityShift: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
  };
  summary: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Calculate comprehensive battle statistics
 */
export function calculateBattleStats(battles: Battle[]): BattleStats {
  if (!battles || battles.length === 0) {
    return {
      totalBattles: 0,
      liveBattles: 0,
      endedBattles: 0,
      avgKillsPerBattle: 0,
      avgFamePerBattle: 0,
      avgParticipantsPerBattle: 0,
      avgDurationMinutes: 0,
      killsPerMinute: 0,
      totalKills: 0,
      totalFame: 0,
      totalParticipants: 0,
      intensityDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        extreme: 0
      },
      factionDistribution: {},
      zoneTypeDistribution: {
        crystal_tower: 0,
        territory: 0,
        open_world: 0
      },
      avgBattleDurationMinutes: 0
    };
  }

  const now = Date.now();
  const twentyMinutesAgo = now - 20 * 60 * 1000;

  let totalKills = 0;
  let totalFame = 0;
  let totalParticipants = 0;
  let liveBattles = 0;
  let endedBattles = 0;
  let totalDuration = 0;
  const intensityDistribution = {
    low: 0,
    medium: 0,
    high: 0,
    extreme: 0
  };
  const factionDistribution: Record<string, number> = {};
  const zoneTypeDistribution = {
    crystal_tower: 0,
    territory: 0,
    open_world: 0
  };

  battles.forEach((battle) => {
    // Count totals
    totalKills += battle.totalKills || 0;
    totalFame += battle.totalFame || 0;
    const participants = Object.keys(battle.players || {}).length;
    totalParticipants += participants;

    // Check if live
    const startTime = new Date(battle.startTime).getTime();
    if (startTime > twentyMinutesAgo) {
      liveBattles += 1;
    } else {
      endedBattles += 1;
    }

    // Calculate intensity
    const intensity = classifyBattleIntensity(
      battle.totalKills || 0,
      participants
    );
    intensityDistribution[intensity] += 1;

    // Track faction distribution
    Object.values(battle.guilds || {}).forEach((guild: any) => {
      if (!factionDistribution[guild.name]) {
        factionDistribution[guild.name] = 0;
      }
      factionDistribution[guild.name] += 1;
    });

    Object.values(battle.alliances || {}).forEach((alliance: any) => {
      if (!factionDistribution[alliance.name]) {
        factionDistribution[alliance.name] = 0;
      }
      factionDistribution[alliance.name] += 1;
    });

    // Track zone type
    const zoneType = detectZoneType(battle.clusterName);
    zoneTypeDistribution[zoneType] += 1;

    // Estimate duration (simplified - would need events for accurate calculation)
    totalDuration += estimateBattleDurationFromBattle(battle);
  });

  const totalBattles = battles.length;
  const avgDuration = Math.round(totalDuration / totalBattles);
  const killsPerMinute = avgDuration > 0 
    ? Math.round((totalKills / totalBattles / avgDuration) * 10) / 10 
    : 0;

  return {
    totalBattles,
    liveBattles,
    endedBattles,
    avgKillsPerBattle: Math.round(totalKills / totalBattles),
    avgFamePerBattle: Math.round(totalFame / totalBattles),
    avgParticipantsPerBattle: Math.round(totalParticipants / totalBattles),
    avgDurationMinutes: avgDuration,
    killsPerMinute,
    totalKills,
    totalFame,
    totalParticipants,
    intensityDistribution,
    factionDistribution,
    zoneTypeDistribution,
    avgBattleDurationMinutes: avgDuration
  };
}

/**
 * Compare two battle stats periods
 */
export function compareBattleStats(
  stats1: BattleStats,
  stats2: BattleStats
): BattleStatsComparison {
  const totalBattlesChange = stats2.totalBattles - stats1.totalBattles;
  const totalBattlesChangePercent = stats1.totalBattles > 0
    ? Math.round((totalBattlesChange / stats1.totalBattles) * 100)
    : 0;

  const avgKillsChange = stats2.avgKillsPerBattle - stats1.avgKillsPerBattle;
  const avgKillsChangePercent = stats1.avgKillsPerBattle > 0
    ? Math.round((avgKillsChange / stats1.avgKillsPerBattle) * 100)
    : 0;

  const avgFameChange = stats2.avgFamePerBattle - stats1.avgFamePerBattle;
  const avgFameChangePercent = stats1.avgFamePerBattle > 0
    ? Math.round((avgFameChange / stats1.avgFamePerBattle) * 100)
    : 0;

  const intensityShift = {
    low: stats2.intensityDistribution.low - stats1.intensityDistribution.low,
    medium: stats2.intensityDistribution.medium - stats1.intensityDistribution.medium,
    high: stats2.intensityDistribution.high - stats1.intensityDistribution.high,
    extreme: stats2.intensityDistribution.extreme - stats1.intensityDistribution.extreme
  };

  // Determine overall trend
  const highIntensityBattles1 = stats1.intensityDistribution.high + stats1.intensityDistribution.extreme;
  const highIntensityBattles2 = stats2.intensityDistribution.high + stats2.intensityDistribution.extreme;
  const avgKillsTrend = avgKillsChange > 5 ? 1 : avgKillsChange < -5 ? -1 : 0;
  const intensityTrend = highIntensityBattles2 > highIntensityBattles1 ? 1 : highIntensityBattles2 < highIntensityBattles1 ? -1 : 0;

  const overallTrend = avgKillsTrend + intensityTrend;
  let summary: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (overallTrend >= 1) summary = 'increasing';
  if (overallTrend <= -1) summary = 'decreasing';

  return {
    totalBattlesChange,
    totalBattlesChangePercent,
    avgKillsChange,
    avgKillsChangePercent,
    avgFameChange,
    avgFameChangePercent,
    intensityShift,
    summary
  };
}

/**
 * Detect zone type from cluster name
 */
function detectZoneType(
  clusterName: string | null
): 'crystal_tower' | 'territory' | 'open_world' {
  // Handle null or undefined cluster names
  if (!clusterName) {
    return 'open_world';
  }

  const lowerName = clusterName.toLowerCase();

  // Crystal towers
  if (
    /^[A-Z]{2}-[0-9]{2}$/.test(clusterName) ||
    lowerName.includes('crystal') ||
    lowerName.includes('tower')
  ) {
    return 'crystal_tower';
  }

  // Territories
  if (
    lowerName.includes('territory') ||
    lowerName.includes('hideout') ||
    lowerName.includes('outpost')
  ) {
    return 'territory';
  }

  return 'open_world';
}

/**
 * Estimate battle duration from battle data (simplified)
 */
function estimateBattleDurationFromBattle(battle: Battle): number {
  // Simplified estimation based on kill count
  // Average battle lasts 10-30 minutes depending on size
  const kills = battle.totalKills || 0;
  
  if (kills < 10) return 10;
  if (kills < 30) return 15;
  if (kills < 50) return 20;
  if (kills < 100) return 25;
  return 30;
}

/**
 * Get battle intensity trend
 */
export interface IntensityTrend {
  current: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
  };
  previous: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
  };
  trend: 'escalating' | 'de-escalating' | 'stable';
}

export function getIntensityTrend(
  currentBattles: Battle[],
  previousBattles: Battle[]
): IntensityTrend {
  const currentStats = calculateBattleStats(currentBattles);
  const previousStats = calculateBattleStats(previousBattles);

  const currentHigh = currentStats.intensityDistribution.high + currentStats.intensityDistribution.extreme;
  const previousHigh = previousStats.intensityDistribution.high + previousStats.intensityDistribution.extreme;

  let trend: 'escalating' | 'de-escalating' | 'stable' = 'stable';
  if (currentHigh > previousHigh + 2) trend = 'escalating';
  if (currentHigh < previousHigh - 2) trend = 'de-escalating';

  return {
    current: currentStats.intensityDistribution,
    previous: previousStats.intensityDistribution,
    trend
  };
}

/**
 * Get faction performance in battles
 */
export interface FactionBattlePerformance {
  factionName: string;
  factionType: 'guild' | 'alliance';
  battlesParticipated: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKillsPerBattle: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
}

export function getFactionBattlePerformance(battles: Battle[]): FactionBattlePerformance[] {
  const factionStats: Map<
    string,
    {
      name: string;
      type: 'guild' | 'alliance';
      battles: number;
      wins: number;
      losses: number;
      totalKills: number;
      totalDeaths: number;
    }
  > = new Map();

  battles.forEach((battle) => {
    const factions = [
      ...Object.values(battle.guilds || {}),
      ...Object.values(battle.alliances || {})
    ];

    if (factions.length < 2) return;

    // Find winner
    const winner = factions.reduce((prev, current) =>
      (current.kills || 0) > (prev.kills || 0) ? current : prev
    );

    factions.forEach((faction: any) => {
      if (!factionStats.has(faction.id)) {
        factionStats.set(faction.id, {
          name: faction.name,
          type: 'allianceId' in faction ? 'alliance' : 'guild',
          battles: 0,
          wins: 0,
          losses: 0,
          totalKills: 0,
          totalDeaths: 0
        });
      }

      const stats = factionStats.get(faction.id)!;
      stats.battles += 1;
      stats.totalKills += faction.kills || 0;
      stats.totalDeaths += faction.deaths || 0;

      if (faction.id === winner.id) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
    });
  });

  return Array.from(factionStats.values()).map((stats) => {
    const kdRatio = stats.totalDeaths > 0 
      ? Math.round((stats.totalKills / stats.totalDeaths) * 10) / 10 
      : stats.totalKills;
    
    const winRate = stats.battles > 0 
      ? Math.round((stats.wins / stats.battles) * 100) 
      : 0;

    return {
      factionName: stats.name,
      factionType: stats.type,
      battlesParticipated: stats.battles,
      wins: stats.wins,
      losses: stats.losses,
      winRate,
      avgKillsPerBattle: Math.round(stats.totalKills / stats.battles),
      totalKills: stats.totalKills,
      totalDeaths: stats.totalDeaths,
      kdRatio
    };
  }).sort((a, b) => b.winRate - a.winRate);
}
