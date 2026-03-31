'use client';

import { useState } from 'react';
import { Swords, ChevronDown, ChevronUp, Skull, Trophy, Users, Clock, Flame, TrendingUp, Award, Shield, Activity, BarChart3, UsersRound } from 'lucide-react';
import type { Battle, Guild, Player } from '../types';

interface Props {
  battle: Battle;
  isExpanded: boolean;
  onExpand: () => void;
  isLive: boolean;
  onCopyLink: () => void;
  formatTimeAgo: (date: string) => string;
  t: (key: string) => string;
}

export function BattleRow({
  battle,
  isExpanded,
  onExpand,
  isLive,
  onCopyLink,
  formatTimeAgo,
  t
}: Props) {
  const playerCount = Object.keys(battle.players || {}).length;
  const guildCount = Object.keys(battle.guilds || {}).length;

  // Calculate faction balance
  const factions = Object.values(battle.guilds || {});
  const redFame = factions
    .filter(g => g.allianceId === '1' || g.name.toLowerCase().includes('red'))
    .reduce((sum, g) => sum + g.killFame, 0);
  const blueFame = factions
    .filter(g => g.allianceId === '2' || g.name.toLowerCase().includes('blue'))
    .reduce((sum, g) => sum + g.killFame, 0);
  const totalFame = battle.totalFame || 1;
  const redPercentage = Math.round((redFame / totalFame) * 100);
  const bluePercentage = Math.round((blueFame / totalFame) * 100);

  // Get top 3 players
  const topPlayers = Object.values(battle.players || {})
    .sort((a, b) => b.killFame - a.killFame)
    .slice(0, 3);

  return (
    <>
      <tr 
        className="group hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={onExpand}
      >
        {/* Battle Column */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg flex-shrink-0 ${isLive ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              <Swords className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-foreground">Battle #{battle.id}</span>
                {isLive && (
                  <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full animate-pulse">
                    {t('live')}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {battle.clusterName} • {guildCount} {t('guilds')}
              </div>
              {/* Faction Balance Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted/50 flex">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                    style={{ width: `${redPercentage}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${bluePercentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{redPercentage}%/{bluePercentage}%</span>
              </div>
            </div>
          </div>
        </td>

        {/* Time Column */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold text-foreground">{formatTimeAgo(battle.startTime)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(battle.startTime).toLocaleString()}
              </div>
            </div>
          </div>
        </td>

        {/* Kills Column */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Skull className="h-4 w-4 text-destructive" />
            <div>
              <div className="font-mono font-bold text-foreground">{battle.totalKills.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('kills')}</div>
            </div>
          </div>
        </td>

        {/* Fame Column */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <div>
              <div className="font-mono font-bold text-warning">{formatNumber(battle.totalFame)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('fame')}</div>
            </div>
          </div>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <tr>
          <td colSpan={4} className="px-4 py-4 bg-muted/30">
            <div className="max-w-full overflow-x-auto">
              <BattleDetailsExpanded
                battle={battle}
                topPlayers={topPlayers}
                redPercentage={redPercentage}
                bluePercentage={bluePercentage}
                t={t}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function BattleDetailsExpanded({
  battle,
  topPlayers,
  redPercentage,
  bluePercentage,
  t
}: {
  battle: Battle;
  topPlayers: Player[];
  redPercentage: number;
  bluePercentage: number;
  t: (key: string) => string;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'guilds' | 'alliances' | 'players'>('overview');
  
  const playerCount = Object.keys(battle.players || {}).length;
  const guildCount = Object.keys(battle.guilds || {}).length;
  const allianceCount = Object.keys(battle.alliances || {}).length;

  // Get all guilds and alliances
  const guilds = Object.values(battle.guilds || {});
  const alliances = Object.values(battle.alliances || {});
  const players = Object.values(battle.players || {});

  // Find the two main competing factions (top 2 alliances or guild groups)
  const allianceGroups: Map<string, any[]> = new Map();
  guilds.forEach(guild => {
    const allianceId = guild.allianceId || 'no-alliance';
    if (!allianceGroups.has(allianceId)) {
      allianceGroups.set(allianceId, []);
    }
    allianceGroups.get(allianceId)!.push(guild);
  });

  // Sort alliances by total fame
  const sortedAlliances = Array.from(allianceGroups.entries())
    .map(([id, guilds]) => ({
      id,
      guilds,
      totalKills: guilds.reduce((sum, g) => sum + (g.kills || 0), 0),
      totalFame: guilds.reduce((sum, g) => sum + (g.killFame || 0), 0),
      totalDeaths: guilds.reduce((sum, g) => sum + (g.deaths || 0), 0),
      name: guilds[0]?.allianceName || t('independentGuilds')
    }))
    .sort((a, b) => b.totalFame - a.totalFame);

  // Get top 2 factions
  const factionA = sortedAlliances[0] || { id: 'A', guilds: [], totalKills: 0, totalFame: 0, totalDeaths: 0, name: t('factionA') };
  const factionB = sortedAlliances[1] || { id: 'B', guilds: [], totalKills: 0, totalFame: 0, totalDeaths: 0, name: t('factionB') };

  // Calculate players per faction
  const factionAGuildIds = factionA.guilds.map(g => g.id);
  const factionBGuildIds = factionB.guilds.map(g => g.id);
  
  const factionAPlayers = players.filter(p => factionAGuildIds.includes(p.guildId));
  const factionBPlayers = players.filter(p => factionBGuildIds.includes(p.guildId));

  const factionAStats = {
    kills: factionA.totalKills,
    deaths: factionA.totalDeaths,
    fame: factionA.totalFame,
    guilds: factionA.guilds.length,
    players: factionAPlayers.length
  };

  const factionBStats = {
    kills: factionB.totalKills,
    deaths: factionB.totalDeaths,
    fame: factionB.totalFame,
    guilds: factionB.guilds.length,
    players: factionBPlayers.length
  };

  // Calculate advantage and determine winner
  const totalFame = factionAStats.fame + factionBStats.fame;
  const factionAPercentage = totalFame > 0 ? Math.round((factionAStats.fame / totalFame) * 100) : 50;
  const factionBPercentage = 100 - factionAPercentage;
  
  const kdRatioA = factionAStats.deaths > 0 ? (factionAStats.kills / factionAStats.deaths).toFixed(2) : '∞';
  const kdRatioB = factionBStats.deaths > 0 ? (factionBStats.kills / factionBStats.deaths).toFixed(2) : '∞';
  
  // Determine winner
  const winner = factionAPercentage > 55 ? 'A' : factionBPercentage > 55 ? 'B' : 'draw';
  const victoryMargin = Math.abs(factionAPercentage - factionBPercentage);
  const isStomp = victoryMargin > 30;
  const isClose = victoryMargin < 10;

  return (
    <div className="space-y-6">
      {/* Battle Result Header - Clean & Simple */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`text-center flex-1 ${winner === 'A' ? 'text-primary' : ''}`}>
            <div className="text-4xl sm:text-5xl font-black mb-2">{factionAStats.kills.toLocaleString()}</div>
            <div className="text-sm font-bold text-foreground mb-1">{factionA.name}</div>
            <div className="text-xs text-muted-foreground">{factionAStats.kills.toLocaleString()} {t('kills')} • {factionAStats.deaths.toLocaleString()} {t('deaths')}</div>
          </div>
          
          <div className="px-6 flex flex-col items-center">
            <div className="text-2xl font-black text-muted-foreground mb-2">VS</div>
            {winner !== 'draw' && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                winner === 'A' || winner === 'B' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {winner === 'A' || winner === 'B' ? t('victory') : t('draw')}
              </div>
            )}
          </div>
          
          <div className={`text-center flex-1 ${winner === 'B' ? 'text-primary' : ''}`}>
            <div className="text-4xl sm:text-5xl font-black mb-2">{factionBStats.kills.toLocaleString()}</div>
            <div className="text-sm font-bold text-foreground mb-1">{factionB.name}</div>
            <div className="text-xs text-muted-foreground">{factionBStats.kills.toLocaleString()} {t('kills')} • {factionBStats.deaths.toLocaleString()} {t('deaths')}</div>
          </div>
        </div>

        {/* Battle Flow Bar */}
        <div className="relative h-6 rounded-full overflow-hidden bg-muted/30">
          <div
            className={`absolute left-0 top-0 h-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              winner === 'A' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'
            }`}
            style={{ width: `${factionAPercentage}%` }}
          >
            {factionAPercentage > 15 && `${factionAPercentage}%`}
          </div>
          <div
            className={`absolute right-0 top-0 h-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              winner === 'B' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'
            }`}
            style={{ width: `${factionBPercentage}%` }}
          >
            {factionBPercentage > 15 && `${factionBPercentage}%`}
          </div>
        </div>
        
        {/* Battle Result Text */}
        <div className="text-center mt-4">
          {winner === 'draw' ? (
            <p className="text-sm text-muted-foreground">
              <Activity className="h-4 w-4 inline mr-1" />
              {t('competitiveBattle')}
            </p>
          ) : (
            <p className="text-sm">
              <Award className={`h-4 w-4 inline mr-1 ${winner === 'A' || winner === 'B' ? 'text-primary' : ''}`} />
              <span className={winner === 'A' || winner === 'B' ? 'text-primary font-bold' : 'text-muted-foreground'}>
                {winner === 'A' ? factionA.name : factionB.name} {t('won')}
              </span>
              {victoryMargin > 30 ? ` ${t('withDominatingPerformance')}` : victoryMargin > 20 ? ` ${t('clearly')}` : ` ${t('inCloseFight')}`}
            </p>
          )}
        </div>
      </div>

      {/* Key Stats - Simplified */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-xs text-muted-foreground mb-1">{t('factionAFame')}</div>
          <div className="text-lg font-bold text-warning">{formatNumber(factionAStats.fame)}</div>
          <div className="text-xs text-muted-foreground mt-1">{factionAPercentage}% {t('ofTotal')}</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-xs text-muted-foreground mb-1">{t('factionBFame')}</div>
          <div className="text-lg font-bold text-warning">{formatNumber(factionBStats.fame)}</div>
          <div className="text-xs text-muted-foreground mt-1">{factionBPercentage}% {t('ofTotal')}</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-xs text-muted-foreground mb-1">{t('factionAKd')}</div>
          <div className="text-lg font-bold">{kdRatioA}</div>
          <div className="text-xs text-muted-foreground mt-1">{factionAStats.kills.toLocaleString()}{t('k')} / {factionAStats.deaths.toLocaleString()}{t('d')}</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-xs text-muted-foreground mb-1">{t('factionBKd')}</div>
          <div className="text-lg font-bold">{kdRatioB}</div>
          <div className="text-xs text-muted-foreground mt-1">{factionBStats.kills.toLocaleString()}{t('k')} / {factionBStats.deaths.toLocaleString()}{t('d')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-none px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" /> {t('overview')}
          </button>
          <button
            onClick={() => setActiveTab('guilds')}
            className={`flex-none px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === 'guilds'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Swords className="h-4 w-4 inline mr-1" /> {t('guilds')} ({guildCount})
          </button>
          <button
            onClick={() => setActiveTab('alliances')}
            className={`flex-none px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === 'alliances'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-1" /> {t('alliances')} ({allianceCount})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-none px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === 'players'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <UsersRound className="h-4 w-4 inline mr-1" /> {t('players')} ({playerCount})
          </button>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && (
            <BattleOverview
              factionA={factionA}
              factionB={factionB}
              factionAStats={factionAStats}
              factionBStats={factionBStats}
              factionAPercentage={factionAPercentage}
              factionBPercentage={factionBPercentage}
              winner={winner}
              t={t}
            />
          )}
          {activeTab === 'guilds' && (
            <div className="space-y-1">
              <GuildList guilds={guilds} factionAGuildIds={factionAGuildIds} factionAName={factionA.name} t={t} />
            </div>
          )}
          {activeTab === 'alliances' && (
            <div className="space-y-1">
              <AllianceList alliances={alliances} factionAId={factionA.id} factionAName={factionA.name} t={t} />
            </div>
          )}
          {activeTab === 'players' && (
            <div className="space-y-1">
              <PlayerList players={players} guilds={guilds} factionAGuildIds={factionAGuildIds} t={t} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BattleOverview({ factionA, factionB, factionAStats, factionBStats, factionAPercentage, factionBPercentage, winner, t }: {
  factionA: any;
  factionB: any;
  factionAStats: any;
  factionBStats: any;
  factionAPercentage: number;
  factionBPercentage: number;
  winner: 'A' | 'B' | 'draw';
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Battle Flow */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3">{t('battleFlow')}</h4>
        <div className="relative h-4 rounded-full overflow-hidden bg-muted/50">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${
              winner === 'A' ? 'bg-primary' : 'bg-muted-foreground'
            }`}
            style={{ width: `${factionAPercentage}%` }}
          />
          <div
            className={`absolute right-0 top-0 h-full transition-all duration-500 ${
              winner === 'B' ? 'bg-primary' : 'bg-muted-foreground'
            }`}
            style={{ width: `${factionBPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={`font-bold ${winner === 'A' ? 'text-primary' : 'text-muted-foreground'}`}>
            {factionA.name} {factionAPercentage}%
          </span>
          <span className={`font-bold ${winner === 'B' ? 'text-primary' : 'text-muted-foreground'}`}>
            {factionB.name} {factionBPercentage}%
          </span>
        </div>
      </div>

      {/* Faction Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl p-4 border-2 ${winner === 'A' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
          <h4 className="font-bold text-primary mb-3">{factionA.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('kills')}</span>
              <span className="font-mono font-bold">{factionAStats.kills.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('deaths')}</span>
              <span className="font-mono font-bold">{factionAStats.deaths.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('kdRatio')}</span>
              <span className="font-mono font-bold">{(factionAStats.deaths > 0 ? (factionAStats.kills / factionAStats.deaths).toFixed(2) : '∞')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('fame')}</span>
              <span className="font-mono font-bold text-warning">{formatNumber(factionAStats.fame)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">{t('guilds')}</span>
              <span className="font-mono font-bold">{factionAStats.guilds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('players')}</span>
              <span className="font-mono font-bold">{factionAStats.players}</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 border-2 ${winner === 'B' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
          <h4 className="font-bold text-primary mb-3">{factionB.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('kills')}</span>
              <span className="font-mono font-bold">{factionBStats.kills.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('deaths')}</span>
              <span className="font-mono font-bold">{factionBStats.deaths.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('kdRatio')}</span>
              <span className="font-mono font-bold">{(factionBStats.deaths > 0 ? (factionBStats.kills / factionBStats.deaths).toFixed(2) : '∞')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('fame')}</span>
              <span className="font-mono font-bold text-warning">{formatNumber(factionBStats.fame)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground">{t('guilds')}</span>
              <span className="font-mono font-bold">{factionBStats.guilds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('players')}</span>
              <span className="font-mono font-bold">{factionBStats.players}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BattleStatCard({ label, value, kdRatio, percentage, faction, isWinner }: {
  label: string;
  value: string;
  kdRatio?: string;
  percentage?: string;
  faction: 'A' | 'B';
  isWinner: boolean;
}) {
  return (
    <div className={`bg-card rounded-xl p-3 border-2 ${isWinner ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isWinner ? 'bg-primary' : 'bg-muted-foreground'}`} />
        <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
      </div>
      <div className={`font-mono font-bold text-lg ${isWinner ? 'text-primary' : 'text-foreground'}`}>{value}</div>
      {kdRatio && (
        <div className="text-xs text-muted-foreground mt-1">K/D: {kdRatio}</div>
      )}
      {percentage && (
        <div className="text-xs text-muted-foreground mt-1">Share: {percentage}</div>
      )}
    </div>
  );
}

function GuildList({ guilds, factionAGuildIds, factionAName, t, searchQuery }: {
  guilds: any[];
  factionAGuildIds: string[];
  factionAName: string;
  t: (key: string) => string;
  searchQuery?: string;
}) {
  const sortedGuilds = [...guilds].sort((a, b) => (b.killFame || 0) - (a.killFame || 0));
  
  return (
    <>
      {sortedGuilds.map((guild, idx) => {
        const isFactionA = factionAGuildIds.includes(guild.id);
        
        return (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isFactionA
                ? 'bg-primary/5 border-primary/30'
                : 'bg-muted/30 border-border/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isFactionA ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-foreground text-sm truncate">
                  {searchQuery ? <HighlightMatch text={guild.name} query={searchQuery} /> : guild.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {searchQuery && guild.allianceName ? (
                    <HighlightMatch text={guild.allianceName} query={searchQuery} />
                  ) : (
                    guild.allianceName || t('independent')
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-mono font-bold text-foreground text-sm">{guild.kills?.toLocaleString() || 0} {t('kills')}</div>
              <div className="text-xs text-muted-foreground">{formatNumber(guild.killFame || 0)} {t('fame')}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function AllianceList({ alliances, factionAId, factionAName, t, searchQuery }: {
  alliances: any[];
  factionAId: string;
  factionAName: string;
  t: (key: string) => string;
  searchQuery?: string;
}) {
  const sortedAlliances = [...alliances].sort((a, b) => (b.killFame || 0) - (a.killFame || 0));
  
  return (
    <>
      {sortedAlliances.map((alliance, idx) => {
        const isFactionA = alliance.id === factionAId;
        
        return (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isFactionA
                ? 'bg-primary/5 border-primary/30'
                : 'bg-muted/30 border-border/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isFactionA ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-foreground text-sm truncate">
                  {searchQuery ? <HighlightMatch text={alliance.name} query={searchQuery} /> : alliance.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{t('alliance')}</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-mono font-bold text-foreground text-sm">{alliance.kills?.toLocaleString() || 0} {t('kills')}</div>
              <div className="text-xs text-muted-foreground">{formatNumber(alliance.killFame || 0)} {t('fame')}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function PlayerList({ players, guilds, factionAGuildIds, t, searchQuery }: {
  players: any[];
  guilds: any[];
  factionAGuildIds: string[];
  t: (key: string) => string;
  searchQuery?: string;
}) {
  const sortedPlayers = [...players].sort((a, b) => (b.killFame || 0) - (a.killFame || 0));
  
  return (
    <>
      {sortedPlayers.map((player, idx) => {
        const guild = guilds.find(g => g.id === player.guildId);
        const isFactionA = guild && factionAGuildIds.includes(guild.id);
        
        return (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isFactionA
                ? 'bg-primary/5 border-primary/30'
                : 'bg-muted/30 border-border/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isFactionA ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-foreground text-sm truncate">
                  {searchQuery ? <HighlightMatch text={player.name} query={searchQuery} /> : player.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {searchQuery && guild?.name ? (
                    <HighlightMatch text={guild.name} query={searchQuery} />
                  ) : (
                    guild?.name || t('noGuild')
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-mono font-bold text-foreground text-sm">{player.kills?.toLocaleString() || 0} {t('kills')}</div>
              <div className="text-xs text-muted-foreground">{formatNumber(player.killFame || 0)} {t('fame')}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// Highlight matching text component
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return <>{text}</>;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  
  return (
    <>
      {before}
      <mark className="bg-primary/30 text-primary font-bold rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}

function StatCard({ label, value, icon, highlight }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-card rounded-xl p-4 border ${highlight ? 'border-warning/50 bg-warning/5' : 'border-border/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={`font-mono font-bold ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function PlayerCard({ player, rank, t }: {
  player: Player;
  rank: number;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-card rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
          rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
          rank === 2 ? 'bg-gray-400/20 text-gray-400' :
          rank === 3 ? 'bg-amber-600/20 text-amber-600' :
          'bg-muted text-muted-foreground'
        }`}>
          {rank}
        </div>
        <span className="font-semibold text-foreground text-sm truncate flex-1">{player.name}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-1 truncate">{player.guildName}</div>
      <div className="font-mono font-bold text-warning text-sm">{formatNumber(player.killFame)} {t('fame')}</div>
    </div>
  );
}

function formatNumber(num: number | undefined | null) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}
