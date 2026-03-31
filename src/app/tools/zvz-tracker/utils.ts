import type { Battle, BattleSide, ZvZFilters } from './types';

/**
 * Format time ago from date string
 */
export function formatTimeAgo(dateString: string, t: (key: string, params?: any) => string): string {
  const date = new Date(dateString);
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
}

/**
 * Format numbers with K, M, B suffixes
 */
export function formatNumber(num: number | undefined | null): string {
  if (!num && num !== 0) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'b';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

/**
 * Format item name from type string
 */
export function formatItemName(type: string): string {
  if (!type) return 'Unknown Item';
  const parts = type.split('_');
  let tier = '';
  let name = type;
  let enchant = '';

  if (parts[0].match(/^T\d+$/)) {
    tier = parts[0] + ' ';
    name = parts.slice(1).join(' ');
  }

  if (name.includes('@')) {
    const [baseName, enchantLevel] = name.split('@');
    name = baseName;
    enchant = `.${enchantLevel}`;
  }

  // Capitalize and clean up
  name = name
    .replace(/_/g, ' ')
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return `${tier}${name}${enchant}`;
}

/**
 * Check if battle is live (started within last 20 minutes)
 */
export function isLiveBattle(startTime: string): boolean {
  return new Date(startTime).getTime() > Date.now() - 20 * 60 * 1000;
}

/**
 * Calculate battle sides from battle details
 */
export function getBattleSides(details: any): BattleSide[] {
  const alliances = details.alliances || {};
  const guilds = details.guilds || {};
  const players = details.players || {};
  const factions: BattleSide[] = [];

  // Add alliances
  Object.values(alliances).forEach((alliance: any) => {
    factions.push({
      id: alliance.id,
      name: alliance.name,
      tag: alliance.tag,
      type: 'alliance',
      kills: alliance.kills,
      deaths: alliance.deaths,
      killFame: alliance.killFame,
      participants: [],
      playerCount: 0,
      totalIp: 0,
      averageIp: 0,
      dominancePercentage: 0
    });
  });

  // Process Guilds
  Object.values(guilds).forEach((guild: any) => {
    if (guild.allianceId && alliances[guild.allianceId]) {
      const faction = factions.find((f) => f.id === guild.allianceId);
      if (faction) {
        faction.participants.push(guild.name);
      }
    } else {
      factions.push({
        id: guild.id,
        name: guild.name,
        type: 'guild',
        kills: guild.kills,
        deaths: guild.deaths,
        killFame: guild.killFame,
        participants: [guild.name],
        playerCount: 0,
        totalIp: 0,
        averageIp: 0,
        dominancePercentage: 0
      });
    }
  });

  // Count Players per Faction & IP
  Object.values(players).forEach((player: any) => {
    const guild = guilds[player.guildId];
    if (guild) {
      let faction;
      // Check if guild belongs to an alliance faction
      if (guild.allianceId && alliances[guild.allianceId]) {
        faction = factions.find((f) => f.id === guild.allianceId);
      } else {
        // Guild faction
        faction = factions.find((f) => f.id === guild.id);
      }

      if (faction) {
        faction.playerCount++;
        faction.totalIp += player.averageItemPower || 0;
      }
    }
  });

  // Finalize averages and dominance
  const totalFame = details.totalFame || 1;
  factions.forEach((f) => {
    if (f.playerCount > 0) {
      f.averageIp = Math.round(f.totalIp / f.playerCount);
    }
    f.dominancePercentage = Math.round((f.killFame / totalFame) * 100);
  });

  return factions.sort((a, b) => b.killFame - a.killFame);
}

/**
 * Calculate dominance percentage
 */
export function calculateDominance(fame: number, totalFame: number): number {
  if (!totalFame) return 0;
  return Math.round((fame / totalFame) * 100);
}

/**
 * Calculate K/D ratio
 */
export function calculateKDRatio(kills: number, deaths: number): string {
  if (deaths === 0) return '∞';
  return (kills / deaths).toFixed(1);
}

/**
 * Check if date is within time range
 */
export function isWithinTimeRange(
  dateString: string,
  range: '24h' | '7d' | '30d' | 'all'
): boolean {
  if (range === 'all') return true;

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  switch (range) {
    case '24h':
      return diffInHours <= 24;
    case '7d':
      return diffInHours <= 24 * 7;
    case '30d':
      return diffInHours <= 24 * 30;
    default:
      return true;
  }
}

/**
 * Detect zone type from cluster name
 */
export function detectZoneType(
  clusterName: string | null | undefined
): 'crystal_tower' | 'territory' | 'open_world' {
  if (!clusterName) return 'open_world';
  
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
 * Filter battles based on filters
 */
export function filterBattles(battles: Battle[], filters: ZvZFilters): Battle[] {
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
    if (filters.minParticipants) {
      const playerCount = Object.keys(battle.players || {}).length;
      if (playerCount < filters.minParticipants) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (battle.id.toString().includes(query)) return true;

      // Search by Guilds
      if (
        Object.values(battle.guilds || {}).some((g: any) =>
          g.name.toLowerCase().includes(query)
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

      return false;
    }

    return true;
  });
}
