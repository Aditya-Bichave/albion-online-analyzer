'use client';

import { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  Users, 
  Skull, 
  Shield, 
  Crown, 
  Activity,
  Scroll
} from 'lucide-react';
import type { Battle, Guild, Alliance, Player } from '../types';

interface Props {
  battle: Battle;
  t: (key: string) => string;
}

type Tab = 'overview' | 'analysis' | 'guilds' | 'alliances' | 'players' | 'feed';

export function BattleDetailsExpanded({ battle, t }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('overview'), icon: <Activity className="h-4 w-4" /> },
    { id: 'analysis', label: t('analysis'), icon: <Skull className="h-4 w-4" /> },
    { id: 'guilds', label: t('guilds'), icon: <Shield className="h-4 w-4" /> },
    { id: 'alliances', label: t('alliances'), icon: <Crown className="h-4 w-4" /> },
    { id: 'players', label: t('players'), icon: <Users className="h-4 w-4" /> },
    { id: 'feed', label: t('feed'), icon: <Scroll className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && <OverviewTab battle={battle} t={t} />}
        {activeTab === 'analysis' && <AnalysisTab battle={battle} t={t} />}
        {activeTab === 'guilds' && <GuildsTab battle={battle} t={t} />}
        {activeTab === 'alliances' && <AlliancesTab battle={battle} t={t} />}
        {activeTab === 'players' && <PlayersTab battle={battle} t={t} />}
        {activeTab === 'feed' && <FeedTab battle={battle} t={t} />}
      </div>
    </div>
  );
}

function OverviewTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
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

  const playerCount = Object.keys(battle.players || {}).length;
  const guildCount = Object.keys(battle.guilds || {}).length;

  return (
    <div className="space-y-6">
      {/* Faction Balance */}
      <div>
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('factionBalance')}</h4>
        <div className="h-4 rounded-full overflow-hidden bg-muted/50 flex mb-3">
          <div
            className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
            style={{ width: `${redPercentage}%` }}
          />
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${bluePercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-red-500">{redPercentage}% {t('redFaction')}</span>
          <span className="font-bold text-blue-500">{bluePercentage}% {t('blueFaction')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('totalKills')}
          value={battle.totalKills.toLocaleString()}
          icon={<Skull className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label={t('totalFame')}
          value={formatNumber(battle.totalFame)}
          icon={<Trophy className="h-4 w-4 text-warning" />}
          highlight
        />
        <StatCard
          label={t('players')}
          value={playerCount.toLocaleString()}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label={t('guilds')}
          value={guildCount.toString()}
          icon={<Swords className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Battle Info */}
      <div className="bg-card rounded-xl p-4 border border-border/50">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('battleInfo')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('battleId')}</span>
            <span className="font-mono font-bold text-foreground">#{battle.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('zone')}</span>
            <span className="font-bold text-foreground">{battle.clusterName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('startTime')}</span>
            <span className="font-mono text-foreground">{new Date(battle.startTime).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
  const factions = Object.values(battle.guilds || {});
  
  // Calculate faction stats
  const redFaction = factions.filter(g => g.allianceId === '1' || g.name.toLowerCase().includes('red'));
  const blueFaction = factions.filter(g => g.allianceId === '2' || g.name.toLowerCase().includes('blue'));
  
  const redKills = redFaction.reduce((sum, g) => sum + g.kills, 0);
  const blueKills = blueFaction.reduce((sum, g) => sum + g.kills, 0);
  const redDeaths = redFaction.reduce((sum, g) => sum + g.deaths, 0);
  const blueDeaths = blueFaction.reduce((sum, g) => sum + g.deaths, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Red Faction Stats */}
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">{t('redFaction')}</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('kills')}</span>
              <span className="font-mono font-bold text-red-500">{redKills.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('deaths')}</span>
              <span className="font-mono font-bold text-red-500">{redDeaths.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">K/D</span>
              <span className="font-mono font-bold text-red-500">{redDeaths > 0 ? (redKills / redDeaths).toFixed(2) : '∞'}</span>
            </div>
          </div>
        </div>

        {/* Blue Faction Stats */}
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
          <h4 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-4">{t('blueFaction')}</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('kills')}</span>
              <span className="font-mono font-bold text-blue-500">{blueKills.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('deaths')}</span>
              <span className="font-mono font-bold text-blue-500">{blueDeaths.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">K/D</span>
              <span className="font-mono font-bold text-blue-500">{blueDeaths > 0 ? (blueKills / blueDeaths).toFixed(2) : '∞'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('topPerformers')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(battle.players || {})
            .sort((a, b) => b.killFame - a.killFame)
            .slice(0, 3)
            .map((player, index) => (
              <PlayerCard key={player.id} player={player} rank={index + 1} t={t} />
            ))}
        </div>
      </div>
    </div>
  );
}

function GuildsTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
  const guilds = Object.values(battle.guilds || {}).sort((a, b) => b.killFame - a.killFame);

  return (
    <div className="space-y-4">
      {guilds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">{t('noGuildData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guilds.map((guild) => (
            <GuildCard key={guild.id} guild={guild} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlliancesTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
  const alliances = Object.values(battle.alliances || {}).sort((a, b) => b.killFame - a.killFame);

  return (
    <div className="space-y-4">
      {alliances.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">{t('noAllianceData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alliances.map((alliance) => (
            <AllianceCard key={alliance.id} alliance={alliance} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayersTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
  const players = Object.values(battle.players || {}).sort((a, b) => b.killFame - a.killFame);

  return (
    <div className="space-y-4">
      {players.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold">{t('noPlayerData')}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">{t('rank')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">{t('player')}</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">{t('kills')}</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">{t('deaths')}</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">{t('fame')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {players.map((player, index) => (
                <tr key={player.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-muted-foreground">#{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.guildName}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-destructive">{player.kills.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{player.deaths.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-warning">{formatNumber(player.killFame)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeedTab({ battle, t }: { battle: Battle; t: (key: string) => string }) {
  // Note: Battle events would need to be fetched separately
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Scroll className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="font-bold">{t('feedComingSoon')}</p>
      <p className="text-sm mt-2">{t('feedDescription')}</p>
    </div>
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
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono font-bold ${highlight ? 'text-warning' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function GuildCard({ guild, t }: { guild: Guild; t: (key: string) => string }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-foreground truncate">{guild.name}</h4>
        {guild.tag && <span className="text-xs text-muted-foreground">[{guild.tag}]</span>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('kills')}</span>
          <span className="font-mono font-bold text-foreground">{guild.kills.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('deaths')}</span>
          <span className="font-mono text-muted-foreground">{guild.deaths.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('fame')}</span>
          <span className="font-mono font-bold text-warning">{formatNumber(guild.killFame)}</span>
        </div>
      </div>
    </div>
  );
}

function AllianceCard({ alliance, t }: { alliance: Alliance; t: (key: string) => string }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-foreground truncate">{alliance.name}</h4>
        {alliance.tag && <span className="text-xs text-muted-foreground">[{alliance.tag}]</span>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('kills')}</span>
          <span className="font-mono font-bold text-foreground">{alliance.kills.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('deaths')}</span>
          <span className="font-mono text-muted-foreground">{alliance.deaths.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('fame')}</span>
          <span className="font-mono font-bold text-warning">{formatNumber(alliance.killFame)}</span>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, rank, t }: { player: Player; rank: number; t: (key: string) => string }) {
  return (
    <div className="bg-card rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
          rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
          rank === 2 ? 'bg-gray-400/20 text-gray-400' :
          rank === 3 ? 'bg-amber-600/20 text-amber-600' :
          'bg-muted text-muted-foreground'
        }`}>
          {rank}
        </div>
        <span className="font-semibold text-foreground text-sm truncate">{player.name}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">{player.guildName}</div>
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
