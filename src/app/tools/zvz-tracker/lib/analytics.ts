import {
  Battle,
  BattleAnalytics,
  GuildStats,
  AllianceStats,
  PlayerStats,
  FactionStat,
  BattleEvent,
  Player
} from '../types';

/**
 * Calculate comprehensive analytics from battles array
 */
export function calculateBattleAnalytics(battles: Battle[]): BattleAnalytics {
  if (!battles || battles.length === 0) {
    return {
      totalBattles: 0,
      liveBattles: 0,
      avgKillsPerBattle: 0,
      avgFamePerBattle: 0,
      avgParticipants: 0,
      totalKills: 0,
      totalFame: 0,
      factionStats: [],
      topGuilds: [],
      topAlliances: [],
      topPlayers: []
    };
  }

  const now = Date.now();
  const liveBattles = battles.filter(
    (b) => new Date(b.startTime).getTime() > now - 20 * 60 * 1000
  );

  const totalKills = battles.reduce((sum, b) => sum + (b.totalKills || 0), 0);
  const totalFame = battles.reduce((sum, b) => sum + (b.totalFame || 0), 0);
  const totalParticipants = battles.reduce(
    (sum, b) => sum + Object.keys(b.players || {}).length,
    0
  );

  return {
    totalBattles: battles.length,
    liveBattles: liveBattles.length,
    avgKillsPerBattle: Math.round(totalKills / battles.length),
    avgFamePerBattle: Math.round(totalFame / battles.length),
    avgParticipants: Math.round(totalParticipants / battles.length),
    totalKills,
    totalFame,
    factionStats: calculateFactionStats(battles),
    topGuilds: calculateGuildStats(battles),
    topAlliances: calculateAllianceStats(battles),
    topPlayers: calculatePlayerStats(battles)
  };
}

/**
 * Calculate faction statistics (guilds and alliances combined)
 */
function calculateFactionStats(battles: Battle[]): FactionStat[] {
  const stats: Record<
    string,
    {
      id: string;
      name: string;
      type: 'guild' | 'alliance';
      kills: number;
      deaths: number;
      fame: number;
      battles: number;
    }
  > = {};

  battles.forEach((battle) => {
    // Process Guilds
    Object.values(battle.guilds || {}).forEach((guild: any) => {
      if (!stats[guild.id]) {
        stats[guild.id] = {
          id: guild.id,
          name: guild.name,
          type: 'guild',
          kills: 0,
          deaths: 0,
          fame: 0,
          battles: 0
        };
      }
      stats[guild.id].kills += guild.kills || 0;
      stats[guild.id].deaths += guild.deaths || 0;
      stats[guild.id].fame += guild.killFame || 0;
      stats[guild.id].battles += 1;
    });

    // Process Alliances
    Object.values(battle.alliances || {}).forEach((alliance: any) => {
      if (!stats[alliance.id]) {
        stats[alliance.id] = {
          id: alliance.id,
          name: alliance.name,
          type: 'alliance',
          kills: 0,
          deaths: 0,
          fame: 0,
          battles: 0
        };
      }
      stats[alliance.id].kills += alliance.kills || 0;
      stats[alliance.id].deaths += alliance.deaths || 0;
      stats[alliance.id].fame += alliance.killFame || 0;
      stats[alliance.id].battles += 1;
    });
  });

  return Object.values(stats)
    .map((stat) => ({
      ...stat,
      winRate: calculateWinRate(stat.kills, stat.deaths),
      avgKillsPerBattle: Math.round(stat.kills / stat.battles),
      kdRatio: calculateKDRatio(stat.kills, stat.deaths)
    }))
    .sort((a, b) => b.fame - a.fame);
}

/**
 * Calculate guild statistics across all battles
 */
export function calculateGuildStats(battles: Battle[]): GuildStats[] {
  const stats: Record<
    string,
    {
      id: string;
      name: string;
      tag?: string;
      totalKills: number;
      totalDeaths: number;
      totalFame: number;
      battlesParticipated: number;
    }
  > = {};

  battles.forEach((battle) => {
    Object.values(battle.guilds || {}).forEach((guild: any) => {
      if (!stats[guild.id]) {
        stats[guild.id] = {
          id: guild.id,
          name: guild.name,
          tag: guild.tag,
          totalKills: 0,
          totalDeaths: 0,
          totalFame: 0,
          battlesParticipated: 0
        };
      }
      stats[guild.id].totalKills += guild.kills || 0;
      stats[guild.id].totalDeaths += guild.deaths || 0;
      stats[guild.id].totalFame += guild.killFame || 0;
      stats[guild.id].battlesParticipated += 1;
    });
  });

  return Object.values(stats)
    .map((stat, index) => ({
      ...stat,
      avgKillsPerBattle: Math.round(stat.totalKills / stat.battlesParticipated),
      kdRatio: calculateKDRatio(stat.totalKills, stat.totalDeaths),
      rank: 0 // Will be set after sorting
    }))
    .sort((a, b) => b.totalFame - a.totalFame)
    .map((stat, index) => ({ ...stat, rank: index + 1 }))
    .slice(0, 100); // Top 100
}

/**
 * Calculate alliance statistics across all battles
 */
export function calculateAllianceStats(battles: Battle[]): AllianceStats[] {
  const stats: Record<
    string,
    {
      id: string;
      name: string;
      tag?: string;
      totalKills: number;
      totalDeaths: number;
      totalFame: number;
      battlesParticipated: number;
    }
  > = {};

  battles.forEach((battle) => {
    Object.values(battle.alliances || {}).forEach((alliance: any) => {
      if (!stats[alliance.id]) {
        stats[alliance.id] = {
          id: alliance.id,
          name: alliance.name,
          tag: alliance.tag,
          totalKills: 0,
          totalDeaths: 0,
          totalFame: 0,
          battlesParticipated: 0
        };
      }
      stats[alliance.id].totalKills += alliance.kills || 0;
      stats[alliance.id].totalDeaths += alliance.deaths || 0;
      stats[alliance.id].totalFame += alliance.killFame || 0;
      stats[alliance.id].battlesParticipated += 1;
    });
  });

  return Object.values(stats)
    .map((stat) => ({
      ...stat,
      avgKillsPerBattle: Math.round(
        stat.totalKills / stat.battlesParticipated
      ),
      kdRatio: calculateKDRatio(stat.totalKills, stat.totalDeaths),
      rank: 0 // Will be set after sorting
    }))
    .sort((a, b) => b.totalFame - a.totalFame)
    .map((stat, index) => ({ ...stat, rank: index + 1 }))
    .slice(0, 100); // Top 100
}

/**
 * Calculate player statistics across all battles
 */
export function calculatePlayerStats(battles: Battle[]): PlayerStats[] {
  const stats: Record<
    string,
    {
      id: string;
      name: string;
      guildName?: string;
      totalKills: number;
      totalDeaths: number;
      totalFame: number;
      battlesParticipated: number;
      totalItemPower: number;
      itemPowerCount: number;
    }
  > = {};

  battles.forEach((battle) => {
    Object.values(battle.players || {}).forEach((player: any) => {
      if (!stats[player.id]) {
        stats[player.id] = {
          id: player.id,
          name: player.name,
          guildName: player.guildName,
          totalKills: 0,
          totalDeaths: 0,
          totalFame: 0,
          battlesParticipated: 0,
          totalItemPower: 0,
          itemPowerCount: 0
        };
      }
      stats[player.id].totalKills += player.kills || 0;
      stats[player.id].totalDeaths += player.deaths || 0;
      stats[player.id].totalFame += player.killFame || 0;
      stats[player.id].battlesParticipated += 1;
      if (player.averageItemPower) {
        stats[player.id].totalItemPower += player.averageItemPower;
        stats[player.id].itemPowerCount += 1;
      }
    });
  });

  return Object.values(stats)
    .map((stat) => ({
      ...stat,
      avgItemPower: Math.round(
        stat.itemPowerCount > 0
          ? stat.totalItemPower / stat.itemPowerCount
          : 0
      ),
      kdRatio: calculateKDRatio(stat.totalKills, stat.totalDeaths),
      rank: 0 // Will be set after sorting
    }))
    .sort((a, b) => b.totalFame - a.totalFame)
    .map((stat, index) => ({ ...stat, rank: index + 1 }))
    .slice(0, 100); // Top 100
}

/**
 * Helper: Calculate K/D ratio
 */
function calculateKDRatio(kills: number, deaths: number): number {
  if (deaths === 0) return kills;
  return Math.round((kills / deaths) * 10) / 10;
}

/**
 * Helper: Calculate win rate (simplified as kill participation rate)
 */
function calculateWinRate(kills: number, deaths: number): number {
  const total = kills + deaths;
  if (total === 0) return 0;
  return Math.round((kills / total) * 100);
}

// ============================================================================
// ADVANCED ANALYTICS - PHASE 2
// ============================================================================

/**
 * Battle intensity classification based on kills and participants
 */
export function classifyBattleIntensity(
  kills: number,
  participants: number
): 'low' | 'medium' | 'high' | 'extreme' {
  const killsPerParticipant = participants > 0 ? kills / participants : 0;

  // Extreme: 100+ kills OR 5+ kills per participant
  if (kills >= 100 || killsPerParticipant >= 5) {
    return 'extreme';
  }

  // High: 50-99 kills OR 3-5 kills per participant
  if (kills >= 50 || killsPerParticipant >= 3) {
    return 'high';
  }

  // Medium: 20-49 kills OR 1-3 kills per participant
  if (kills >= 20 || killsPerParticipant >= 1) {
    return 'medium';
  }

  // Low: < 20 kills
  return 'low';
}

/**
 * Performance score calculation (0-100)
 * Composite rating based on kills, deaths, fame, and item power
 */
export function calculatePerformanceScore(stats: {
  kills: number;
  deaths: number;
  fame: number;
  ip: number;
}): number {
  const { kills, deaths, fame, ip } = stats;

  // K/D component (max 40 points)
  const kdRatio = deaths === 0 ? kills : kills / deaths;
  const kdScore = Math.min(40, kdRatio * 10);

  // Fame component (max 30 points) - scaled logarithmically
  const fameScore = Math.min(30, Math.log10(fame + 1) * 10);

  // Item Power component (max 20 points) - normalized around 1600 IP
  const ipScore = Math.min(20, Math.max(0, (ip - 1000) / 50));

  // Kill count component (max 10 points)
  const killScore = Math.min(10, kills * 0.5);

  const totalScore = kdScore + fameScore + ipScore + killScore;
  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

/**
 * Estimate battle duration based on first/last kill times
 */
export function estimateBattleDuration(events: BattleEvent[]): number {
  if (!events || events.length === 0) {
    return 0;
  }

  const timestamps = events
    .map((e) => new Date(e.timestamp).getTime())
    .sort((a, b) => a - b);

  const durationMs = timestamps[timestamps.length - 1] - timestamps[0];
  return Math.round(durationMs / (1000 * 60)); // Convert to minutes
}

/**
 * Calculate kills per minute for a battle
 */
export function calculateKillsPerMinute(
  totalKills: number,
  durationMinutes: number
): number {
  if (durationMinutes === 0) return 0;
  return Math.round((totalKills / durationMinutes) * 10) / 10;
}

/**
 * Zone control statistics
 */
export interface ZoneControlStats {
  crystalTowers: ZoneStat[];
  territories: TerritoryStat[];
  controlHistory: ControlTimelineEntry[];
}

export interface ZoneStat {
  zoneName: string;
  controllingFaction: string;
  battlesFought: number;
  lastBattleTime: string;
  strategicValue: 'low' | 'medium' | 'high' | 'critical';
}

export interface TerritoryStat {
  territoryName: string;
  controllingGuild: string;
  battlesFought: number;
  lastBattleTime: string;
  strategicValue: 'low' | 'medium' | 'high' | 'critical';
}

export interface ControlTimelineEntry {
  timestamp: string;
  zoneName: string;
  previousController: string;
  newController: string;
  battleId: number;
}

/**
 * Analyze zone control from battles
 */
export function analyzeZoneControl(battles: Battle[]): ZoneControlStats {
  const crystalTowers: Map<string, ZoneStat> = new Map();
  const territories: Map<string, TerritoryStat> = new Map();
  const controlHistory: ControlTimelineEntry[] = [];

  battles.forEach((battle) => {
    const zoneType = detectZoneType(battle.clusterName);
    const dominantFaction = getDominantFaction(battle);

    if (zoneType === 'crystal_tower') {
      const existing = crystalTowers.get(battle.clusterName);
      if (existing) {
        existing.battlesFought += 1;
        existing.controllingFaction = dominantFaction;
        existing.lastBattleTime = battle.startTime;
      } else {
        crystalTowers.set(battle.clusterName, {
          zoneName: battle.clusterName,
          controllingFaction: dominantFaction,
          battlesFought: 1,
          lastBattleTime: battle.startTime,
          strategicValue: calculateStrategicValue(battle.clusterName)
        });
      }
    } else if (zoneType === 'territory') {
      const existing = territories.get(battle.clusterName);
      if (existing) {
        existing.battlesFought += 1;
        existing.controllingGuild = dominantFaction;
        existing.lastBattleTime = battle.startTime;
      } else {
        territories.set(battle.clusterName, {
          territoryName: battle.clusterName,
          controllingGuild: dominantFaction,
          battlesFought: 1,
          lastBattleTime: battle.startTime,
          strategicValue: calculateStrategicValue(battle.clusterName)
        });
      }
    }
  });

  return {
    crystalTowers: Array.from(crystalTowers.values()),
    territories: Array.from(territories.values()),
    controlHistory
  };
}

/**
 * Detect zone type from cluster name
 */
function detectZoneType(
  clusterName: string
): 'crystal_tower' | 'territory' | 'open_world' {
  const lowerName = clusterName.toLowerCase();

  // Crystal towers have specific naming patterns
  if (
    lowerName.includes('crystal') ||
    lowerName.includes('tower') ||
    /^[A-Z]{2}-[0-9]{2}$/.test(clusterName)
  ) {
    return 'crystal_tower';
  }

  // Territory zones often have specific patterns
  if (
    lowerName.includes('territory') ||
    lowerName.includes('hideout') ||
    lowerName.includes('outpost')
  ) {
    return 'territory';
  }

  // Default to open world
  return 'open_world';
}

/**
 * Get dominant faction from battle
 */
function getDominantFaction(battle: Battle): string {
  const allFactions = [
    ...Object.values(battle.guilds || {}),
    ...Object.values(battle.alliances || {})
  ];

  if (allFactions.length === 0) return 'Unknown';

  const dominant = allFactions.reduce((prev, current) =>
    (current.kills || 0) > (prev.kills || 0) ? current : prev
  );

  return dominant.name || 'Unknown';
}

/**
 * Calculate strategic value of a zone
 */
export function calculateStrategicValue(
  zoneName: string
): 'low' | 'medium' | 'high' | 'critical' {
  const lowerName = zoneName.toLowerCase();

  // Critical: Crystal towers in central regions
  if (
    lowerName.includes('crystal') &&
    (lowerName.includes('central') || /^[A-C][0-9]{2}$/.test(zoneName))
  ) {
    return 'critical';
  }

  // High: Crystal towers or territory capitals
  if (
    lowerName.includes('crystal') ||
    lowerName.includes('capital') ||
    lowerName.includes('hideout')
  ) {
    return 'high';
  }

  // Medium: Territory zones
  if (lowerName.includes('territory') || lowerName.includes('outpost')) {
    return 'medium';
  }

  // Low: Open world
  return 'low';
}

/**
 * Faction war score calculation
 */
export interface FactionWarScore {
  factionId: string;
  factionName: string;
  factionType: 'guild' | 'alliance';
  totalScore: number;
  killScore: number;
  territoryScore: number;
  consistencyScore: number;
}

export function calculateFactionWarScore(
  guilds: GuildStats[],
  alliances: AllianceStats[]
): FactionWarScore[] {
  const scores: FactionWarScore[] = [];

  // Process guilds
  guilds.forEach((guild) => {
    const killScore = Math.min(50, guild.kdRatio * 10);
    const territoryScore = Math.min(30, guild.battlesParticipated * 2);
    const consistencyScore = Math.min(20, guild.avgKillsPerBattle);

    scores.push({
      factionId: guild.id,
      factionName: guild.name,
      factionType: 'guild',
      totalScore: Math.round(killScore + territoryScore + consistencyScore),
      killScore: Math.round(killScore),
      territoryScore: Math.round(territoryScore),
      consistencyScore: Math.round(consistencyScore)
    });
  });

  // Process alliances
  alliances.forEach((alliance) => {
    const killScore = Math.min(50, alliance.kdRatio * 10);
    const territoryScore = Math.min(30, alliance.battlesParticipated * 2);
    const consistencyScore = Math.min(20, alliance.avgKillsPerBattle);

    scores.push({
      factionId: alliance.id,
      factionName: alliance.name,
      factionType: 'alliance',
      totalScore: Math.round(killScore + territoryScore + consistencyScore),
      killScore: Math.round(killScore),
      territoryScore: Math.round(territoryScore),
      consistencyScore: Math.round(consistencyScore)
    });
  });

  return scores.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Performance trend analysis
 */
export function analyzePerformanceTrend(
  stats: any[],
  timeWindow: number
): 'improving' | 'declining' | 'stable' {
  if (!stats || stats.length < 2) return 'stable';

  // Split stats into two halves
  const midpoint = Math.floor(stats.length / 2);
  const firstHalf = stats.slice(0, midpoint);
  const secondHalf = stats.slice(midpoint);

  // Calculate averages
  const firstAvg =
    firstHalf.reduce((sum, s) => sum + (s.fame || s.kills || 0), 0) /
    firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, s) => sum + (s.fame || s.kills || 0), 0) /
    secondHalf.length;

  // Determine trend
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (changePercent > 10) return 'improving';
  if (changePercent < -10) return 'declining';
  return 'stable';
}

/**
 * Guild efficiency rating (K/D with minimum kill threshold)
 */
export function calculateGuildEfficiency(
  kills: number,
  deaths: number,
  minKillThreshold: number = 10
): number {
  if (kills < minKillThreshold) {
    // Penalize guilds with very few kills
    return kills < 5 ? 0 : kills / minKillThreshold;
  }

  if (deaths === 0) return kills;
  return Math.round((kills / deaths) * 10) / 10;
}

/**
 * Participant activity score
 */
export function calculateActivityScore(
  kills: number,
  deaths: number,
  fame: number,
  battlesParticipated: number
): number {
  const killComponent = kills * 2;
  const fameComponent = Math.log10(fame + 1) * 5;
  const participationComponent = battlesParticipated * 3;
  const deathPenalty = deaths * 0.5;

  return Math.round(
    Math.max(0, killComponent + fameComponent + participationComponent - deathPenalty)
  );
}

/**
 * Faction win/loss tracking
 */
export interface FactionWinLoss {
  factionId: string;
  factionName: string;
  factionType: 'guild' | 'alliance';
  wins: number;
  losses: number;
  winRate: number;
  battlesFought: number;
}

export function trackFactionWinLoss(battles: Battle[]): FactionWinLoss[] {
  const factionStats: Map<
    string,
    {
      id: string;
      name: string;
      type: 'guild' | 'alliance';
      wins: number;
      losses: number;
    }
  > = new Map();

  battles.forEach((battle) => {
    const factions = [
      ...Object.values(battle.guilds || {}),
      ...Object.values(battle.alliances || {})
    ];

    if (factions.length < 2) return;

    // Find winner (highest kills)
    const winner = factions.reduce((prev, current) =>
      (current.kills || 0) > (prev.kills || 0) ? current : prev
    );

    factions.forEach((faction: any) => {
      if (!factionStats.has(faction.id)) {
        factionStats.set(faction.id, {
          id: faction.id,
          name: faction.name,
          type: 'allianceId' in faction ? 'alliance' : 'guild',
          wins: 0,
          losses: 0
        });
      }

      const stats = factionStats.get(faction.id)!;
      if (faction.id === winner.id) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
    });
  });

  return Array.from(factionStats.values()).map((stats) => {
    const battlesFought = stats.wins + stats.losses;
    return {
      factionId: stats.id,
      factionName: stats.name,
      factionType: stats.type,
      wins: stats.wins,
      losses: stats.losses,
      winRate: battlesFought > 0 ? Math.round((stats.wins / battlesFought) * 100) : 0,
      battlesFought
    };
  }).sort((a, b) => b.winRate - a.winRate);
}
