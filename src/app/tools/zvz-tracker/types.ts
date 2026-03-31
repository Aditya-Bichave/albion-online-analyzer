// Core Battle Types
export interface Battle {
  id: number;
  startTime: string;
  totalKills: number;
  totalFame: number;
  clusterName: string;
  guilds: Record<string, Guild>;
  alliances: Record<string, Alliance>;
  players: Record<string, Player>;
}

export interface Guild {
  id: string;
  name: string;
  tag?: string;
  kills: number;
  deaths: number;
  killFame: number;
  allianceId?: string;
}

export interface Alliance {
  id: string;
  name: string;
  tag?: string;
  kills: number;
  deaths: number;
  killFame: number;
}

export interface Player {
  id: string;
  name: string;
  guildId?: string;
  guildName?: string;
  allianceId?: string;
  allianceTag?: string;
  kills: number;
  deaths: number;
  killFame: number;
  averageItemPower?: number;
}

export interface BattleEvent {
  eventId: string;
  battleId: number;
  timestamp: string;
  killer: {
    name: string;
    guildId?: string;
    guildName?: string;
    allianceId?: string;
  };
  victim: {
    name: string;
    guildId?: string;
    guildName?: string;
    allianceId?: string;
  };
  killStreak?: number;
}

// Analytics Types
export interface BattleAnalytics {
  totalBattles: number;
  liveBattles: number;
  avgKillsPerBattle: number;
  avgFamePerBattle: number;
  avgParticipants: number;
  totalKills: number;
  totalFame: number;
  factionStats: FactionStat[];
  topGuilds: GuildStats[];
  topAlliances: AllianceStats[];
  topPlayers: PlayerStats[];
}

export interface FactionStat {
  id: string;
  name: string;
  type: 'guild' | 'alliance';
  kills: number;
  deaths: number;
  fame: number;
  battles: number;
  winRate: number;
  avgKillsPerBattle: number;
  kdRatio: number;
}

export interface GuildStats {
  id: string;
  name: string;
  tag?: string;
  totalKills: number;
  totalDeaths: number;
  totalFame: number;
  battlesParticipated: number;
  avgKillsPerBattle: number;
  kdRatio: number;
  rank: number;
}

export interface AllianceStats {
  id: string;
  name: string;
  tag?: string;
  totalKills: number;
  totalDeaths: number;
  totalFame: number;
  battlesParticipated: number;
  avgKillsPerBattle: number;
  kdRatio: number;
  rank: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  guildName?: string;
  totalKills: number;
  totalDeaths: number;
  totalFame: number;
  battlesParticipated: number;
  avgItemPower: number;
  kdRatio: number;
  rank: number;
}

// Filter Types
export interface ZvZFilters {
  timeRange: '24h' | '7d' | '30d' | 'all';
  faction?: string;
  zoneType?: 'crystal_tower' | 'territory' | 'open_world' | 'all';
  minParticipants?: number;
  battleStatus: 'all' | 'live' | 'ended';
  searchQuery: string;
}

// UI Types
export interface BattleSide {
  id: string;
  name: string;
  tag?: string;
  type: 'guild' | 'alliance';
  kills: number;
  deaths: number;
  killFame: number;
  participants: string[];
  playerCount: number;
  totalIp: number;
  averageIp: number;
  dominancePercentage: number;
}

// API Response Types
export interface BattlesResponse {
  battles: Battle[];
  error?: string;
}

export interface BattleDetailsResponse {
  battle: Battle | null;
  error?: string;
}

export interface SearchResponse {
  results: any[];
  error?: string;
}

export interface EventsResponse {
  events: BattleEvent[];
  error?: string;
}

// Zone Statistics
export interface ZoneStat {
  zoneName: string;
  battleCount: number;
  totalKills: number;
  totalFame: number;
  controllingFaction?: string;
  strategicValue?: 'low' | 'medium' | 'high' | 'critical';
}

// Battle Statistics Overview
export interface BattleStats {
  totalBattles: number;
  liveBattles: number;
  avgKillsPerBattle: number;
  avgFamePerBattle: number;
  avgParticipants: number;
  killsPerMinute: number;
  totalFame: number;
  battleIntensity: 'low' | 'medium' | 'high' | 'extreme';
}

// Chart data types
export interface BattleIntensityDistribution {
  low: number;
  medium: number;
  high: number;
  extreme: number;
}
