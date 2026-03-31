'use client';

import { Trophy, Shield, Crown, Star } from 'lucide-react';
import { GuildStats, AllianceStats } from '../types';

interface Props {
  topGuilds: GuildStats[];
  topAlliances: AllianceStats[];
  t: (key: string) => string;
}

export function LeaderboardSection({ topGuilds, topAlliances, t }: Props) {
  // Combine and sort top performers
  const combined = [
    ...topGuilds.slice(0, 5).map(g => ({ ...g, type: 'guild' as const })),
    ...topAlliances.slice(0, 5).map(a => ({ ...a, type: 'alliance' as const }))
  ].sort((a, b) => b.totalFame - a.totalFame).slice(0, 5);

  if (combined.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in-up delay-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-warning/10">
          <Trophy className="h-6 w-6 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{t('recentTopPerformers')}</h3>
          <p className="text-xs text-muted-foreground">{t('topPerformersDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {combined.map((entry, idx) => (
          <LeaderboardCard
            key={idx}
            entry={entry}
            rank={idx + 1}
            t={t}
            delay={idx * 100}
          />
        ))}
      </div>
    </div>
  );
}

interface LeaderboardCardProps {
  entry: any;
  rank: number;
  t: (key: string) => string;
  delay?: number;
}

function LeaderboardCard({ entry, rank, t, delay = 0 }: LeaderboardCardProps) {
  const isTop3 = rank <= 3;

  return (
    <div
      className={`
        relative group overflow-hidden
        bg-card backdrop-blur-sm
        border-1 border-border
        rounded-2xl
        p-4 sm:p-5
        transition-all duration-500
        hover:scale-105 hover:shadow-xl hover:border-primary/50
        animate-fade-in-up
      `}
      style={{
        animationDelay: `${delay}ms`
      }}
    >
      {/* Rank Badge */}
      <div className="absolute top-3 right-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${rank === 1 ? 'bg-warning/20 text-warning' : ''}
          ${rank === 2 ? 'bg-muted/30 text-foreground' : ''}
          ${rank === 3 ? 'bg-amber-700/20 text-amber-700' : ''}
          ${rank > 3 ? 'bg-muted/20 text-muted-foreground' : ''}
        `}>
          {rank === 1 ? <Crown className="h-4 w-4" /> :
           rank === 2 ? <Star className="h-4 w-4" /> :
           rank === 3 ? <Star className="h-4 w-4" /> :
           <span className="text-sm font-black">{rank}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Type Icon */}
        <div className="flex items-center gap-2 mb-3">
          {entry.type === 'guild' ? (
            <div className="p-2 rounded-lg bg-success/10">
              <Shield className="h-4 w-4 text-success" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {entry.type === 'guild' ? t('guild') : t('alliance')}
          </span>
        </div>

        {/* Name */}
        <div className="font-semibold text-base sm:text-lg text-foreground mb-3 truncate" title={entry.name}>
          {entry.name}
          {entry.tag && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              [{entry.tag}]
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium uppercase">{t('fame')}</span>
            <span className="text-warning font-mono font-bold cursor-help">
              {formatNumber(entry.totalFame)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium uppercase">{t('kd')}</span>
            <span className="text-foreground font-mono font-semibold">
              {entry.totalDeaths > 0 ? (entry.totalKills / entry.totalDeaths).toFixed(1) : '∞'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium uppercase">{t('battles')}</span>
            <span className="text-info font-mono font-semibold">
              {entry.battlesParticipated}
            </span>
          </div>
        </div>

        {/* Decorative Element */}
        <div className={`
          absolute -bottom-8 -right-8 w-24 h-24 rounded-full
          bg-gradient-to-br from-warning/10 to-transparent
          opacity-0 group-hover:opacity-50
          transition-opacity duration-500
          blur-xl
        `} />
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}
