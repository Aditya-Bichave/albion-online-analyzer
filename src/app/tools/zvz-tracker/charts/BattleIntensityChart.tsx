'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Activity } from 'lucide-react';
import { ChartEmptyState } from '../components/ChartEmptyState';
import { CHART_COLORS, CHART_STYLES, getIntensityColor } from '../lib/chart-theme';
import '../styles/premium-animations.css';

interface BattleIntensityDistribution {
  low: number;
  medium: number;
  high: number;
  extreme: number;
}

interface Props {
  distribution: BattleIntensityDistribution;
  t: (key: string) => string;
}

export default function BattleIntensityChart({ distribution, t }: Props) {
  // Prepare chart data
  const chartData = [
    {
      name: t('low'),
      value: distribution.low,
      color: getIntensityColor('low'),
      description: t('lowPlayers'),
    },
    {
      name: t('medium'),
      value: distribution.medium,
      color: getIntensityColor('medium'),
      description: t('mediumPlayers'),
    },
    {
      name: t('high'),
      value: distribution.high,
      color: getIntensityColor('high'),
      description: t('highPlayers'),
    },
    {
      name: t('extreme'),
      value: distribution.extreme,
      color: getIntensityColor('extreme'),
      description: t('extremePlayers'),
    },
  ];

  // Calculate total battles
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  // Get the most common intensity
  const mostCommon = Object.entries(distribution).reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: 'low', value: 0 }
  );

  const getIntensityLabel = (key: string) => {
    const labels: Record<string, string> = {
      low: t('low'),
      medium: t('medium'),
      high: t('high'),
      extreme: t('extreme'),
    };
    return labels[key] || key;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

      return (
        <div className="bg-card/95 backdrop-blur-sm border-2 border-border p-4 rounded-2xl shadow-xl min-w-[180px] animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4" style={{ color: data.color }} />
            <p className="text-foreground text-sm font-medium">{data.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{t('battles')}</span>
              <p className="text-primary font-bold font-mono text-lg">
                {data.value}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{t('share')}</span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {percentage}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{t('players')}</span>
              <span className="text-foreground">{data.description}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (total === 0) {
    return (
      <ChartEmptyState
        message="No battle intensity data"
        subMessage="Battle data will appear here once fights are recorded"
        icon={<Activity className="h-16 w-16 mb-4 opacity-20" />}
      />
    );
  }

  return (
    <div className="bg-card/50 p-4 sm:p-6 rounded-2xl border border-border/50 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{t('battleIntensityTitle')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('battleIntensityDesc')}
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground">
          {t('mostCommon')}:{' '}
          <span className="font-bold" style={{ color: getIntensityColor(mostCommon.key as any) }}>
            {getIntensityLabel(mostCommon.key)}
          </span>
        </div>
      </div>

      <div className="w-full" style={{ height: '280px', minHeight: '250px' }} role="img" aria-label={t('battleIntensityTitle')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_STYLES.gridLine.stroke}
              opacity={CHART_STYLES.gridLine.opacity}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={CHART_STYLES.axis.stroke}
              fontSize={11}
              tick={{ fill: CHART_STYLES.axis.stroke }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={CHART_STYLES.axis.stroke}
              fontSize={11}
              tick={{ fill: CHART_STYLES.axis.stroke }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Battles"
              animationDuration={800}
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - Responsive */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 px-2">
        {chartData.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-semibold text-foreground">
              {entry.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
