'use client';

import { Battle, BattleEvent } from '../types';
import FactionComparison from './FactionComparison';
import MVPShowcase from './MVPShowcase';
import BattleFeed from './BattleFeed';
import BattleDetailsTabs from './BattleDetailsTabs';
import { Swords, Shield, Crown, Users, ScrollText } from 'lucide-react';
import '../styles/premium-animations.css';

interface Props {
  battle: Battle;
  events: BattleEvent[];
  activeTab: 'analysis' | 'guilds' | 'alliances' | 'players' | 'feed';
  onTabChange: (tab: string) => void;
  feedPage: number;
  onFeedPageChange: (page: number) => void;
  t: (key: string) => string;
  tKill: (key: string) => string;
  loading?: boolean;
  onClose?: () => void;
}

export default function BattleDetails({
  battle,
  events,
  activeTab,
  onTabChange,
  feedPage,
  onFeedPageChange,
  t,
  tKill,
  loading = false,
  onClose
}: Props) {
  if (loading) return <BattleDetailsSkeleton />;

  const tabs = [
    { id: 'analysis', label: t('analysis'), icon: <Swords className="h-4 w-4" /> },
    { id: 'guilds', label: t('guilds'), icon: <Shield className="h-4 w-4" />, count: Object.keys(battle.guilds || {}).length },
    { id: 'alliances', label: t('alliances'), icon: <Crown className="h-4 w-4" />, count: Object.keys(battle.alliances || {}).length },
    { id: 'players', label: t('players'), icon: <Users className="h-4 w-4" />, count: Object.keys(battle.players || {}).length },
    { id: 'feed', label: tKill('killFeed'), icon: <ScrollText className="h-4 w-4" /> }
  ];

  return (
    <div className="border-t border-border bg-background/50 backdrop-blur-sm animate-slide-in-from-top">
      <div className="p-4 md:p-6">
        {/* Battle Summary */}
        <FactionComparison battle={battle} t={t} />

        {/* Premium Tabs */}
        <BattleDetailsTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} t={t} />

        {/* Tab Content */}
        <div className="space-y-4 animate-fade-in">
          {activeTab === 'analysis' && (
            <MVPShowcase battle={battle} t={t} />
          )}

          {activeTab === 'guilds' && (
            <GuildsTable guilds={Object.values(battle.guilds || {})} t={t} />
          )}

          {activeTab === 'alliances' && (
            <AlliancesTable alliances={Object.values(battle.alliances || {})} t={t} />
          )}

          {activeTab === 'players' && (
            <PlayersTable players={Object.values(battle.players || {})} t={t} />
          )}

          {activeTab === 'feed' && (
            <BattleFeed
              events={events}
              currentPage={feedPage}
              onPageChange={onFeedPageChange}
              t={tKill}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BattleDetailsSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 bg-muted/20 rounded-2xl" />
        <div className="h-40 bg-muted/20 rounded-2xl" />
      </div>
      <div className="h-2 bg-muted/20 rounded-full" />
      <div className="flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 w-28 bg-muted/20 rounded-xl flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted/20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function GuildsTable({ guilds, t }: { guilds: any[]; t: (key: string) => string }) {
  if (guilds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl">
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-bold">{t('noData')}</p>
      </div>
    );
  }

  const sortedGuilds = [...guilds].sort((a, b) => b.killFame - a.killFame);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-4 py-4 text-xs font-bold uppercase text-left text-muted-foreground">
                {t('guild')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('kills')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('deaths')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-right text-muted-foreground">
                {t('fame')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-right text-muted-foreground">
                {t('kdRatio')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedGuilds.map((guild, idx) => (
              <tr 
                key={guild.id} 
                className="hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {guild.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{guild.name}</div>
                      {guild.tag && (
                        <div className="text-xs text-muted-foreground">[{guild.tag}]</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-success">{guild.kills}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-destructive">{guild.deaths}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono font-bold text-warning">{formatNumber(guild.killFame)}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-mono font-bold ${guild.kills > guild.deaths ? 'text-success' : 'text-destructive'}`}>
                    {guild.deaths > 0 ? (guild.kills / guild.deaths).toFixed(2) : '∞'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlliancesTable({ alliances, t }: { alliances: any[]; t: (key: string) => string }) {
  if (alliances.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl">
        <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-bold">{t('noData')}</p>
      </div>
    );
  }

  const sortedAlliances = [...alliances].sort((a, b) => b.killFame - a.killFame);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-4 py-4 text-xs font-bold uppercase text-left text-muted-foreground">
                {t('alliance')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('kills')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('deaths')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-right text-muted-foreground">
                {t('fame')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-right text-muted-foreground">
                {t('kdRatio')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedAlliances.map((alliance, idx) => (
              <tr 
                key={alliance.id} 
                className="hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning font-black text-xs">
                      {alliance.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{alliance.name}</div>
                      {alliance.tag && (
                        <div className="text-xs text-muted-foreground">[{alliance.tag}]</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-success">{alliance.kills}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-destructive">{alliance.deaths}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono font-bold text-warning">{formatNumber(alliance.killFame)}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-mono font-bold ${alliance.kills > alliance.deaths ? 'text-success' : 'text-destructive'}`}>
                    {alliance.deaths > 0 ? (alliance.kills / alliance.deaths).toFixed(2) : '∞'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayersTable({ players, t }: { players: any[]; t: (key: string) => string }) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-bold">{t('noData')}</p>
      </div>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => b.killFame - a.killFame).slice(0, 50);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden animate-fade-in-up">
      <div className="px-4 py-3 text-xs text-muted-foreground border-b border-border/50 bg-muted/30">
        {t('showingTop50')}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="px-4 py-4 text-xs font-bold uppercase text-left text-muted-foreground">
                {t('player')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-left text-muted-foreground">
                {t('guild')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('kills')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-center text-muted-foreground">
                {t('deaths')}
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase text-right text-muted-foreground">
                {t('fame')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedPlayers.map((player, idx) => (
              <tr 
                key={player.id} 
                className="hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-info font-black text-xs">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-bold text-sm">{player.name}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted-foreground">{player.guildName || '-'}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-success">{player.kills}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-mono font-bold text-destructive">{player.deaths}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono font-bold text-warning">{formatNumber(player.killFame)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNumber(num: number | undefined | null) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}
