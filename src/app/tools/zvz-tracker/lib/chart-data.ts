import type { Battle, Player, BattleIntensityDistribution } from '../types';
import type { ZoneControlStats } from './zone-control';
import { calculatePerformanceScore } from './analytics';

/**
 * Transform battle data for Recharts timeline
 */
export function transformBattleTimelineData(
  battles: Battle[],
  timeRange: '24h' | '7d' | '30d'
): any[] {
  if (!battles || battles.length === 0) return [];

  // Determine time bucket size based on range
  const bucketSize = timeRange === '24h' ? 1 : timeRange === '7d' ? 6 : 24; // hours
  const bucketSizeMs = bucketSize * 60 * 60 * 1000;

  // Get time range
  const now = Date.now();
  const rangeMs = timeRange === '24h' 
    ? 24 * 60 * 60 * 1000 
    : timeRange === '7d' 
      ? 7 * 24 * 60 * 60 * 1000 
      : 30 * 24 * 60 * 60 * 1000;

  const startTime = now - rangeMs;

  // Create buckets
  const buckets: Map<
    number,
    {
      timestamp: string;
      battles: number;
      kills: number;
      fame: number;
      participants: number;
    }
  > = new Map();

  // Initialize buckets
  for (let t = startTime; t < now; t += bucketSizeMs) {
    const bucketTime = Math.floor(t / bucketSizeMs) * bucketSizeMs;
    buckets.set(bucketTime, {
      timestamp: new Date(bucketTime).toISOString(),
      battles: 0,
      kills: 0,
      fame: 0,
      participants: 0
    });
  }

  // Fill buckets with battle data
  battles.forEach((battle) => {
    const battleTime = new Date(battle.startTime).getTime();
    if (battleTime < startTime || battleTime > now) return;

    const bucketTime = Math.floor(battleTime / bucketSizeMs) * bucketSizeMs;
    const bucket = buckets.get(bucketTime);

    if (bucket) {
      bucket.battles += 1;
      bucket.kills += battle.totalKills || 0;
      bucket.fame += battle.totalFame || 0;
      bucket.participants += Object.keys(battle.players || {}).length;
    }
  });

  // Convert to array and sort by time
  return Array.from(buckets.values())
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((bucket) => ({
      ...bucket,
      timestamp: formatTimestamp(bucket.timestamp, timeRange),
      kills: bucket.kills,
      fame: Math.round(bucket.fame / 1000), // Convert to K
      participants: bucket.participants,
      battles: bucket.battles
    }));
}

/**
 * Transform faction data for pie/bar chart
 */
export function transformFactionDominanceData(battles: Battle[]): any[] {
  if (!battles || battles.length === 0) return [];

  const factionStats: Map<
    string,
    {
      name: string;
      type: 'guild' | 'alliance';
      kills: number;
      fame: number;
      battles: number;
      wins: number;
    }
  > = new Map();

  battles.forEach((battle) => {
    const factions = [
      ...Object.values(battle.guilds || {}),
      ...Object.values(battle.alliances || {})
    ];

    if (factions.length === 0) return;

    // Find winner
    const winner = factions.reduce((prev, current) =>
      (current.kills || 0) > (prev.kills || 0) ? current : prev
    );

    factions.forEach((faction: any) => {
      if (!factionStats.has(faction.id)) {
        factionStats.set(faction.id, {
          name: faction.name,
          type: 'allianceId' in faction ? 'alliance' : 'guild',
          kills: 0,
          fame: 0,
          battles: 0,
          wins: 0
        });
      }

      const stats = factionStats.get(faction.id)!;
      stats.kills += faction.kills || 0;
      stats.fame += faction.killFame || 0;
      stats.battles += 1;

      if (faction.id === winner.id) {
        stats.wins += 1;
      }
    });
  });

  return Array.from(factionStats.values())
    .map((stats) => ({
      name: stats.name,
      type: stats.type,
      kills: stats.kills,
      fame: Math.round(stats.fame / 1000), // Convert to K
      battles: stats.battles,
      wins: stats.wins,
      winRate: Math.round((stats.wins / stats.battles) * 100),
      avgKills: Math.round(stats.kills / stats.battles)
    }))
    .sort((a, b) => b.fame - a.fame)
    .slice(0, 20); // Top 20 factions
}

/**
 * Transform player stats for radar chart
 */
export function transformPlayerPerformanceData(players: Player[]): any[] {
  if (!players || players.length === 0) return [];

  return players
    .map((player) => {
      const performanceScore = calculatePerformanceScore({
        kills: player.kills || 0,
        deaths: player.deaths || 0,
        fame: player.killFame || 0,
        ip: player.averageItemPower || 1400
      });

      const kdRatio = player.deaths > 0 
        ? Math.round((player.kills / player.deaths) * 10) / 10 
        : player.kills;

      return {
        player: player.name,
        kills: player.kills || 0,
        deaths: player.deaths || 0,
        fame: Math.round((player.killFame || 0) / 1000), // Convert to K
        kdRatio,
        performanceScore,
        ip: player.averageItemPower || 1400,
        guildName: player.guildName
      };
    })
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 10); // Top 10 players
}

/**
 * Transform zone control data for heatmap
 */
export function transformZoneControlData(zoneControl: ZoneControlStats): any[] {
  if (!zoneControl) return [];

  const heatmapData: any[] = [];

  // Add crystal towers
  zoneControl.crystalTowers.forEach((tower) => {
    heatmapData.push({
      zone: tower.zoneName,
      type: 'Crystal Tower',
      controller: tower.controllingFaction,
      battles: tower.battlesFought,
      strategicValue: tower.strategicValue,
      strategicValueNum: strategicValueToNumber(tower.strategicValue),
      lastBattle: tower.lastBattleTime,
      avgKills: tower.avgKillsPerBattle
    });
  });

  // Add territories
  zoneControl.territories.forEach((territory) => {
    heatmapData.push({
      zone: territory.territoryName,
      type: 'Territory',
      controller: territory.controllingGuild,
      battles: territory.battlesFought,
      strategicValue: territory.strategicValue,
      strategicValueNum: strategicValueToNumber(territory.strategicValue),
      lastBattle: territory.lastBattleTime,
      avgKills: territory.avgKillsPerBattle
    });
  });

  return heatmapData.sort((a, b) => b.strategicValueNum - a.strategicValueNum);
}

/**
 * Convert strategic value to number for sorting
 */
function strategicValueToNumber(
  value: 'low' | 'medium' | 'high' | 'critical'
): number {
  switch (value) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
}

/**
 * Format timestamp based on time range
 */
function formatTimestamp(
  timestamp: string,
  timeRange: '24h' | '7d' | '30d'
): string {
  const date = new Date(timestamp);

  if (timeRange === '24h') {
    // Show hour:minute
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (timeRange === '7d') {
    // Show day name
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } else {
    // Show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Transform battle intensity data for stacked bar chart
 */
export function transformIntensityData(battles: Battle[]): BattleIntensityDistribution {
  if (!battles || battles.length === 0) {
    return { low: 0, medium: 0, high: 0, extreme: 0 };
  }

  let low = 0;
  let medium = 0;
  let high = 0;
  let extreme = 0;

  battles.forEach((battle) => {
    const participants = Object.keys(battle.players || {}).length;
    const intensity = classifyBattleIntensity(battle.totalKills || 0, participants);
    
    if (intensity === 'low') {
      low += 1;
    } else if (intensity === 'medium') {
      medium += 1;
    } else if (intensity === 'high') {
      high += 1;
    } else if (intensity === 'extreme') {
      extreme += 1;
    }
  });

  return { low, medium, high, extreme };
}

/**
 * Classify battle intensity
 */
function classifyBattleIntensity(
  kills: number,
  participants: number
): 'low' | 'medium' | 'high' | 'extreme' {
  const killsPerParticipant = participants > 0 ? kills / participants : 0;

  if (kills >= 100 || killsPerParticipant >= 5) {
    return 'extreme';
  }
  if (kills >= 50 || killsPerParticipant >= 3) {
    return 'high';
  }
  if (kills >= 20 || killsPerParticipant >= 1) {
    return 'medium';
  }
  return 'low';
}

/**
 * Transform faction comparison data for grouped bar chart
 */
export function transformFactionComparisonData(battles: Battle[]): any[] {
  if (!battles || battles.length === 0) return [];

  const factionStats: Map<
    string,
    {
      name: string;
      type: 'guild' | 'alliance';
      kills: number;
      deaths: number;
      fame: number;
      battles: number;
    }
  > = new Map();

  battles.forEach((battle) => {
    [...Object.values(battle.guilds || {}), ...Object.values(battle.alliances || {})].forEach(
      (faction: any) => {
        if (!factionStats.has(faction.id)) {
          factionStats.set(faction.id, {
            name: faction.name,
            type: 'allianceId' in faction ? 'alliance' : 'guild',
            kills: 0,
            deaths: 0,
            fame: 0,
            battles: 0
          });
        }

        const stats = factionStats.get(faction.id)!;
        stats.kills += faction.kills || 0;
        stats.deaths += faction.deaths || 0;
        stats.fame += faction.killFame || 0;
        stats.battles += 1;
      }
    );
  });

  return Array.from(factionStats.values())
    .map((stats) => ({
      name: stats.name,
      type: stats.type,
      kills: stats.kills,
      deaths: stats.deaths,
      fame: Math.round(stats.fame / 1000),
      battles: stats.battles,
      kdRatio: stats.deaths > 0 ? Math.round((stats.kills / stats.deaths) * 10) / 10 : stats.kills
    }))
    .sort((a, b) => b.fame - a.fame)
    .slice(0, 15); // Top 15 factions
}

/**
 * Transform battle status data for pie chart
 */
export function transformBattleStatusData(battles: Battle[]): any[] {
  if (!battles || battles.length === 0) return [];

  const now = Date.now();
  const twentyMinutesAgo = now - 20 * 60 * 1000;

  let live = 0;
  let ended = 0;

  battles.forEach((battle) => {
    const startTime = new Date(battle.startTime).getTime();
    if (startTime > twentyMinutesAgo) {
      live += 1;
    } else {
      ended += 1;
    }
  });

  return [
    { name: 'Live Battles', value: live, color: '#22c55e' },
    { name: 'Ended Battles', value: ended, color: '#6b7280' }
  ];
}

/**
 * Transform zone type distribution for pie chart
 */
export function transformZoneTypeData(battles: Battle[]): any[] {
  if (!battles || battles.length === 0) return [];

  let crystal_tower = 0;
  let territory = 0;
  let open_world = 0;

  battles.forEach((battle) => {
    const zoneType = detectZoneType(battle.clusterName);
    if (zoneType === 'crystal_tower') {
      crystal_tower += 1;
    } else if (zoneType === 'territory') {
      territory += 1;
    } else {
      open_world += 1;
    }
  });

  return [
    { name: 'Crystal Towers', value: crystal_tower, color: '#8b5cf6' },
    { name: 'Territories', value: territory, color: '#f59e0b' },
    { name: 'Open World', value: open_world, color: '#6b7280' }
  ];
}

/**
 * Detect zone type from cluster name
 */
function detectZoneType(
  clusterName: string
): 'crystal_tower' | 'territory' | 'open_world' {
  const lowerName = clusterName.toLowerCase();

  if (
    /^[A-Z]{2}-[0-9]{2}$/.test(clusterName) ||
    lowerName.includes('crystal') ||
    lowerName.includes('tower')
  ) {
    return 'crystal_tower';
  }

  if (
    lowerName.includes('territory') ||
    lowerName.includes('hideout') ||
    lowerName.includes('outpost')
  ) {
    return 'territory';
  }

  return 'open_world';
}
