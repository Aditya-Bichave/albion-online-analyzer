'use client';

import type { BattleStats } from '../lib/battle-stats';
import { TrendingUp, Skull, Users, Award } from 'lucide-react';

interface Props {
  stats: BattleStats;
  t: (key: string) => string;
}

export default function StatsOverview({ stats, t }: Props) {
  // Determine battle intensity based on distribution
  const getBattleIntensity = () => {
    const { intensityDistribution } = stats;
    const max = Math.max(
      intensityDistribution.low,
      intensityDistribution.medium,
      intensityDistribution.high,
      intensityDistribution.extreme
    );
    
    if (max === intensityDistribution.extreme) return 'extreme';
    if (max === intensityDistribution.high) return 'high';
    if (max === intensityDistribution.medium) return 'medium';
    return 'low';
  };

  const battleIntensity = getBattleIntensity();

  const statCards = [
    {
      label: t('totalBattles'),
      value: stats.totalBattles,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      color: 'text-primary'
    },
    {
      label: t('liveBattles'),
      value: stats.liveBattles,
      icon: <Skull className="h-5 w-5 text-destructive" />,
      color: 'text-destructive'
    },
    {
      label: t('avgParticipants'),
      value: stats.avgParticipantsPerBattle,
      icon: <Users className="h-5 w-5 text-info" />,
      color: 'text-info'
    },
    {
      label: t('battleIntensity'),
      value: t(battleIntensity),
      icon: <Award className="h-5 w-5 text-warning" />,
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className="bg-card/50 border border-border p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={stat.color}>{stat.icon}</div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
