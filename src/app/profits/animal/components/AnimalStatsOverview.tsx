'use client';

import { TrendingUp, TrendingDown, PawPrint, Coins, Target, AlertTriangle } from 'lucide-react';
import type { AnimalData } from '../types';

interface Props {
  data: AnimalData[];
  quantity: number;
  t: (key: string, values?: Record<string, any>) => string;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export default function AnimalStatsOverview({ data, quantity, t }: Props) {
  // Calculate statistics
  const profitableAnimals = data.filter(a => a.profit > 0);
  const totalAnimals = data.length;
  
  const bestROI = data.length > 0 ? data.reduce((max, a) => a.roi > max.roi ? a : max, data[0]) : null;
  const avgROI = data.length > 0 ? data.reduce((sum, a) => sum + a.roi, 0) / data.length : 0;
  
  const totalPotentialProfit = data.reduce((sum, a) => sum + (a.totalProfit || 0), 0);
  
  const excellentProfits = data.filter(a => a.roi > 50).length;
  const goodProfits = data.filter(a => a.roi > 20 && a.roi <= 50).length;
  const poorProfits = data.filter(a => a.roi <= 20).length;

  const statCards: StatCard[] = [
    {
      label: t('stats.profitableAnimals'),
      value: `${profitableAnimals.length} / ${totalAnimals}`,
      icon: <PawPrint className="h-5 w-5" />,
      color: 'text-success',
      trend: profitableAnimals.length > totalAnimals / 2 ? 'up' : 'down',
      description: t('stats.profitableAnimalsDesc')
    },
    {
      label: t('stats.bestROI'),
      value: bestROI ? `${bestROI.roi.toFixed(1)}%` : '0%',
      icon: <Target className="h-5 w-5" />,
      color: 'text-primary',
      description: bestROI ? `${bestROI.name}` : ''
    },
    {
      label: t('stats.avgROI'),
      value: `${avgROI.toFixed(1)}%`,
      icon: <Coins className="h-5 w-5" />,
      color: avgROI > 0 ? 'text-success' : 'text-destructive',
      trend: avgROI > 0 ? 'up' : avgROI < 0 ? 'down' : 'neutral',
      description: t('stats.avgROIDesc')
    },
    {
      label: t('stats.totalProfit'),
      value: totalPotentialProfit.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: totalPotentialProfit > 0 ? 'text-success' : 'text-destructive',
      description: t('stats.totalProfitDesc', { quantity })
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-card/50 border border-border/50 p-5 rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            
            <div className="relative z-10">
              {/* Icon and Label */}
              <div className="flex items-center justify-between mb-3">
                <div className={stat.color}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {stat.trend === 'neutral' && <span className="h-1 w-3 bg-muted-foreground rounded-full" />}
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </div>

              {/* Description */}
              {stat.description && (
                <div className="text-xs text-muted-foreground/80 truncate" title={stat.description}>
                  {stat.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profitability Distribution */}
      <div className="bg-card/50 border border-border/50 p-5 rounded-xl">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          {t('stats.profitabilityDistribution')}
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Excellent Profits */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">{excellentProfits}</div>
            <div className="text-xs text-success/80 font-bold uppercase">{t('stats.excellent')}</div>
            <div className="text-xs text-muted-foreground/60 mt-1">&gt;50% ROI</div>
          </div>

          {/* Good Profits */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">{goodProfits}</div>
            <div className="text-xs text-warning/80 font-bold uppercase">{t('stats.good')}</div>
            <div className="text-xs text-muted-foreground/60 mt-1">20-50% ROI</div>
          </div>

          {/* Poor Profits */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-destructive mb-1">{poorProfits}</div>
            <div className="text-xs text-destructive/80 font-bold uppercase">{t('stats.poor')}</div>
            <div className="text-xs text-muted-foreground/60 mt-1">≤20% ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
