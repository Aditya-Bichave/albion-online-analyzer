'use client';

import type { BattleStats } from '../lib/battle-stats';
import { TrendingUp, Skull, Users, Award, Zap, Flame, Target, Clock } from 'lucide-react';
import '../styles/premium-animations.css';

interface Props {
  stats: BattleStats;
  t: (key: string) => string;
}

export default function EnhancedStatsOverview({ stats, t }: Props) {
  // Determine battle intensity based on distribution
  const getBattleIntensity = () => {
    const { intensityDistribution } = stats;
    const max = Math.max(
      intensityDistribution.low,
      intensityDistribution.medium,
      intensityDistribution.high,
      intensityDistribution.extreme
    );

    if (max === intensityDistribution.extreme) return { level: 'extreme', color: 'text-destructive', gradient: 'from-destructive/20 to-destructive/10', icon: Flame };
    if (max === intensityDistribution.high) return { level: 'high', color: 'text-primary', gradient: 'from-primary/20 to-primary/10', icon: Zap };
    if (max === intensityDistribution.medium) return { level: 'medium', color: 'text-warning', gradient: 'from-warning/20 to-warning/10', icon: Target };
    return { level: 'low', color: 'text-success', gradient: 'from-success/20 to-success/10', icon: Clock };
  };

  const intensity = getBattleIntensity();
  const IntensityIcon = intensity.icon;

  const statCards = [
    {
      label: t('totalBattles'),
      value: stats.totalBattles,
      icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'text-primary',
      gradient: 'from-primary/20 to-primary/10',
      borderColor: 'border-primary/30',
      tooltip: t('totalBattlesTooltip')
    },
    {
      label: t('liveBattles'),
      value: stats.liveBattles,
      icon: <Skull className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'text-destructive',
      gradient: 'from-destructive/20 to-destructive/10',
      borderColor: 'border-destructive/30',
      tooltip: t('liveBattlesTooltip')
    },
    {
      label: t('avgParticipants'),
      value: stats.avgParticipantsPerBattle,
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'text-info',
      gradient: 'from-info/20 to-info/10',
      borderColor: 'border-info/30',
      tooltip: t('avgParticipantsTooltip')
    },
    {
      label: t('battleIntensity'),
      value: t(intensity.level),
      icon: <IntensityIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: intensity.color,
      gradient: intensity.gradient,
      borderColor: 'border-border/30',
      tooltip: t('battleIntensityTooltip'),
      isIntensity: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {statCards.map((stat, idx) => (
        <StatCard
          key={idx}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          gradient={stat.gradient}
          borderColor={stat.borderColor}
          tooltip={stat.tooltip}
          isIntensity={stat.isIntensity}
          delay={idx * 100}
        />
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  borderColor: string;
  tooltip: string;
  isIntensity?: boolean;
  delay?: number;
}

function StatCard({ label, value, icon, color, gradient, borderColor, tooltip, isIntensity = false, delay = 0 }: StatCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden
        bg-card/50 backdrop-blur-sm
        border ${borderColor}
        rounded-xl sm:rounded-2xl
        p-3 sm:p-4 md:p-5
        transition-all duration-500
        hover:scale-105 hover:shadow-xl
        animate-fade-in-up
        cursor-help
      `}
      style={{ animationDelay: `${delay}ms` }}
      title={tooltip}
    >
      {/* Gradient Background Overlay */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-br ${gradient}
      `} />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`
          inline-flex p-2 sm:p-2.5 rounded-xl
          bg-muted/30 group-hover:bg-muted/50
          transition-all duration-300
          mb-2 sm:mb-3
          group-hover:scale-110
        `}>
          <div className={color}>
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 tabular-nums tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Label */}
        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
          {label}
        </div>

        {/* Decorative Element */}
        <div className={`
          absolute -bottom-2 -right-2 w-16 h-16 rounded-full
          bg-gradient-to-br ${gradient}
          opacity-0 group-hover:opacity-30
          transition-opacity duration-500
          blur-xl
        `} />
      </div>

      {/* Border Glow Effect */}
      <div className={`
        absolute inset-0 rounded-xl sm:rounded-2xl
        border-2 border-transparent
        group-hover:border-${color.replace('text-', '')}/30
        transition-colors duration-300
        pointer-events-none
      `} />
    </div>
  );
}
