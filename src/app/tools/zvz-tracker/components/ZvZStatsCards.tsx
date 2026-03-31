'use client';

import { Swords, Flame, Users, Skull } from 'lucide-react';
import type { Battle } from '../types';

interface Props {
  battles: Battle[];
  liveBattles: Battle[];
  loading?: boolean;
  t: (key: string) => string;
}

export function ZvZStatsCards({ battles, liveBattles, loading = false, t }: Props) {
  // Calculate stats
  const totalBattles = battles.length;
  const liveCount = liveBattles.length;
  const avgParticipants = battles.length > 0
    ? Math.round(battles.reduce((sum, b) => sum + Object.keys(b.players || {}).length, 0) / battles.length)
    : 0;
  const totalKills = battles.reduce((sum, b) => sum + (b.totalKills || 0), 0);

  const stats = [
    {
      label: t('totalBattles'),
      value: totalBattles.toLocaleString(),
      icon: <Swords className="h-5 w-5 text-primary" />,
      bg: 'bg-primary/10',
      trend: null
    },
    {
      label: t('liveBattles'),
      value: liveCount.toLocaleString(),
      icon: <Flame className="h-5 w-5 text-destructive" />,
      bg: 'bg-destructive/10',
      highlight: liveCount > 0,
      trend: null
    },
    {
      label: t('avgParticipants'),
      value: avgParticipants.toLocaleString(),
      icon: <Users className="h-5 w-5 text-success" />,
      bg: 'bg-success/10',
      trend: null
    },
    {
      label: t('totalKills'),
      value: formatNumber(totalKills),
      icon: <Skull className="h-5 w-5 text-warning" />,
      bg: 'bg-warning/10',
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            relative overflow-hidden
            bg-card backdrop-blur-sm
            border-1 border-border
            rounded-2xl
            p-5
            transition-all duration-300
            hover:scale-105 hover:shadow-lg hover:border-primary/50
            animate-fade-in-up
            ${stat.highlight ? 'border-destructive/50 bg-destructive/5' : ''}
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Icon */}
          <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-3`}>
            {stat.icon}
          </div>

          {/* Value */}
          <div className="text-3xl font-bold text-foreground mb-1">
            {loading ? (
              <span>...</span>
            ) : (
              stat.value
            )}
          </div>

          {/* Label */}
          <div className="text-xs font-medium text-muted-foreground">
            {stat.label}
          </div>

          {/* Decorative gradient */}
          <div className={`
            absolute -bottom-12 -right-12 w-32 h-32 rounded-full
            ${stat.bg}
            opacity-20 blur-2xl
            transition-opacity duration-500
            group-hover:opacity-30
          `} />
        </div>
      ))}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}
