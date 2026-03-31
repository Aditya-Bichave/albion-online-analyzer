import type { Battle } from '../types';

/**
 * Zone Control Statistics
 */
export interface ZoneControlStats {
  crystalTowers: ZoneStat[];
  territories: TerritoryStat[];
  controlHistory: ControlTimelineEntry[];
}

/**
 * Zone Statistics for Crystal Towers
 */
export interface ZoneStat {
  zoneName: string;
  controllingFaction: string;
  battlesFought: number;
  lastBattleTime: string;
  strategicValue: 'low' | 'medium' | 'high' | 'critical';
  avgKillsPerBattle: number;
  totalKills: number;
  factionControlHistory: FactionControlEntry[];
}

/**
 * Territory Statistics
 */
export interface TerritoryStat {
  territoryName: string;
  controllingGuild: string;
  battlesFought: number;
  lastBattleTime: string;
  strategicValue: 'low' | 'medium' | 'high' | 'critical';
  avgKillsPerBattle: number;
  totalKills: number;
  guildControlHistory: GuildControlEntry[];
}

/**
 * Control Timeline Entry
 */
export interface ControlTimelineEntry {
  timestamp: string;
  zoneName: string;
  zoneType: 'crystal_tower' | 'territory';
  previousController: string;
  newController: string;
  battleId: number;
  battleKills: number;
}

/**
 * Faction Control Entry
 */
export interface FactionControlEntry {
  timestamp: string;
  factionName: string;
  factionType: 'guild' | 'alliance';
  battleId: number;
}

/**
 * Guild Control Entry
 */
export interface GuildControlEntry {
  timestamp: string;
  guildName: string;
  battleId: number;
}

/**
 * Track zone control from battles
 */
export function trackZoneControl(battles: Battle[]): ZoneControlStats {
  const crystalTowers: Map<string, ZoneStat> = new Map();
  const territories: Map<string, TerritoryStat> = new Map();
  const controlHistory: ControlTimelineEntry[] = [];

  // Sort battles by time
  const sortedBattles = [...battles].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  sortedBattles.forEach((battle) => {
    const zoneType = getStrategicZoneType(battle.clusterName);
    const dominantFaction = getDominantFaction(battle);
    const strategicValue = calculateStrategicValue(battle.clusterName);

    if (zoneType === 'crystal_tower') {
      updateCrystalTower(crystalTowers, battle, dominantFaction, strategicValue);
    } else if (zoneType === 'territory') {
      updateTerritory(territories, battle, dominantFaction, strategicValue);
    }

    // Track control change
    trackControlChange(
      controlHistory,
      crystalTowers,
      territories,
      battle,
      zoneType,
      dominantFaction
    );
  });

  // Finalize control histories
  finalizeControlHistories(crystalTowers, territories);

  return {
    crystalTowers: Array.from(crystalTowers.values()),
    territories: Array.from(territories.values()),
    controlHistory
  };
}

/**
 * Get strategic zone type from cluster name
 */
export function getStrategicZoneType(
  clusterName: string
): 'crystal_tower' | 'territory' | 'open_world' {
  const lowerName = clusterName.toLowerCase();

  // Crystal towers: CT-XX pattern or contains "crystal"/"tower"
  if (
    /^[A-Z]{2}-[0-9]{2}$/.test(clusterName) ||
    lowerName.includes('crystal') ||
    lowerName.includes('tower')
  ) {
    return 'crystal_tower';
  }

  // Territories: contains "territory"/"hideout"/"outpost"
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
 * Get strategic zone name (human-readable)
 */
export function getStrategicZoneName(clusterName: string): string {
  const zoneType = getStrategicZoneType(clusterName);

  if (zoneType === 'crystal_tower') {
    return `Crystal Tower - ${clusterName}`;
  } else if (zoneType === 'territory') {
    return `Territory - ${clusterName}`;
  }

  return clusterName;
}

/**
 * Calculate strategic value of a zone
 */
export function calculateStrategicValue(
  zoneName: string
): 'low' | 'medium' | 'high' | 'critical' {
  const lowerName = zoneName.toLowerCase();

  // Critical: Central crystal towers (A5, B5, C5, etc.)
  if (
    lowerName.includes('crystal') &&
    (lowerName.includes('central') ||
      /^[A-C]5$/.test(zoneName) ||
      /^[A-C]-05$/.test(zoneName))
  ) {
    return 'critical';
  }

  // High: Other crystal towers or capital territories
  if (
    lowerName.includes('crystal') ||
    lowerName.includes('capital') ||
    lowerName.includes('hideout')
  ) {
    return 'high';
  }

  // Medium: Regular territories
  if (
    lowerName.includes('territory') ||
    lowerName.includes('outpost')
  ) {
    return 'medium';
  }

  // Low: Open world
  return 'low';
}

/**
 * Update crystal tower statistics
 */
function updateCrystalTower(
  towers: Map<string, ZoneStat>,
  battle: Battle,
  controllingFaction: string,
  strategicValue: 'low' | 'medium' | 'high' | 'critical'
) {
  const existing = towers.get(battle.clusterName);

  if (existing) {
    existing.battlesFought += 1;
    existing.controllingFaction = controllingFaction;
    existing.lastBattleTime = battle.startTime;
    existing.totalKills += battle.totalKills || 0;
    existing.avgKillsPerBattle = Math.round(
      existing.totalKills / existing.battlesFought
    );
  } else {
    towers.set(battle.clusterName, {
      zoneName: battle.clusterName,
      controllingFaction,
      battlesFought: 1,
      lastBattleTime: battle.startTime,
      strategicValue,
      totalKills: battle.totalKills || 0,
      avgKillsPerBattle: battle.totalKills || 0,
      factionControlHistory: []
    });
  }
}

/**
 * Update territory statistics
 */
function updateTerritory(
  territories: Map<string, TerritoryStat>,
  battle: Battle,
  controllingGuild: string,
  strategicValue: 'low' | 'medium' | 'high' | 'critical'
) {
  const existing = territories.get(battle.clusterName);

  if (existing) {
    existing.battlesFought += 1;
    existing.controllingGuild = controllingGuild;
    existing.lastBattleTime = battle.startTime;
    existing.totalKills += battle.totalKills || 0;
    existing.avgKillsPerBattle = Math.round(
      existing.totalKills / existing.battlesFought
    );
  } else {
    territories.set(battle.clusterName, {
      territoryName: battle.clusterName,
      controllingGuild,
      battlesFought: 1,
      lastBattleTime: battle.startTime,
      strategicValue,
      totalKills: battle.totalKills || 0,
      avgKillsPerBattle: battle.totalKills || 0,
      guildControlHistory: []
    });
  }
}

/**
 * Track control changes
 */
function trackControlChange(
  controlHistory: ControlTimelineEntry[],
  crystalTowers: Map<string, ZoneStat>,
  territories: Map<string, TerritoryStat>,
  battle: Battle,
  zoneType: 'crystal_tower' | 'territory' | 'open_world',
  newController: string
) {
  if (zoneType === 'open_world') return;

  const previousController =
    zoneType === 'crystal_tower'
      ? crystalTowers.get(battle.clusterName)?.controllingFaction
      : territories.get(battle.clusterName)?.controllingGuild;

  // Only track if controller changed or first battle
  if (!previousController || previousController !== newController) {
    controlHistory.push({
      timestamp: battle.startTime,
      zoneName: battle.clusterName,
      zoneType,
      previousController: previousController || 'None',
      newController,
      battleId: battle.id,
      battleKills: battle.totalKills || 0
    });
  }
}

/**
 * Finalize control histories
 */
function finalizeControlHistories(
  crystalTowers: Map<string, ZoneStat>,
  territories: Map<string, TerritoryStat>
) {
  // Build faction control history for crystal towers
  crystalTowers.forEach((tower) => {
    tower.factionControlHistory = [];
  });

  // Build guild control history for territories
  territories.forEach((territory) => {
    territory.guildControlHistory = [];
  });
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
 * Get zone control summary
 */
export interface ZoneControlSummary {
  totalZones: number;
  criticalZones: number;
  highValueZones: number;
  mediumValueZones: number;
  lowValueZones: number;
  mostContestedZone: string | null;
  mostContestedBattles: number;
}

export function getZoneControlSummary(
  zoneControl: ZoneControlStats
): ZoneControlSummary {
  const allZones = [...zoneControl.crystalTowers, ...zoneControl.territories];

  const summary: ZoneControlSummary = {
    totalZones: allZones.length,
    criticalZones: 0,
    highValueZones: 0,
    mediumValueZones: 0,
    lowValueZones: 0,
    mostContestedZone: null,
    mostContestedBattles: 0
  };

  let maxBattles = 0;

  allZones.forEach((zone: any) => {
    // Count by strategic value
    switch (zone.strategicValue) {
      case 'critical':
        summary.criticalZones += 1;
        break;
      case 'high':
        summary.highValueZones += 1;
        break;
      case 'medium':
        summary.mediumValueZones += 1;
        break;
      case 'low':
        summary.lowValueZones += 1;
        break;
    }

    // Track most contested
    if (zone.battlesFought > maxBattles) {
      maxBattles = zone.battlesFought;
      summary.mostContestedZone = zone.zoneName || zone.territoryName;
      summary.mostContestedBattles = zone.battlesFought;
    }
  });

  return summary;
}

/**
 * Get faction zone control count
 */
export function getFactionZoneControl(
  zoneControl: ZoneControlStats
): Record<string, number> {
  const controlCount: Record<string, number> = {};

  zoneControl.crystalTowers.forEach((tower) => {
    if (!controlCount[tower.controllingFaction]) {
      controlCount[tower.controllingFaction] = 0;
    }
    controlCount[tower.controllingFaction] += 1;
  });

  zoneControl.territories.forEach((territory) => {
    if (!controlCount[territory.controllingGuild]) {
      controlCount[territory.controllingGuild] = 0;
    }
    controlCount[territory.controllingGuild] += 1;
  });

  return controlCount;
}
