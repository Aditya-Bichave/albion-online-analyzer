'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Trophy, Shield } from 'lucide-react';
import { ChartEmptyState } from '../components/ChartEmptyState';
import { CHART_COLORS, CHART_STYLES, getFactionColor } from '../lib/chart-theme';
import type { FactionStat } from '../types';
import '../styles/premium-animations.css';

interface Props {
  factions: FactionStat[];
  chartType: 'pie' | 'bar';
  metric: 'fame' | 'kills' | 'battles';
  showDetails?: boolean;
  t: (key: string) => string;
}

export default function FactionDominanceChart({ factions, chartType, metric, showDetails = false, t }: Props) {
  // Get metric value from faction
  const getMetricValue = (faction: FactionStat) => {
    switch (metric) {
      case 'fame': return faction.fame;
      case 'kills': return faction.kills;
      case 'battles': return faction.battles;
      default: return faction.fame;
    }
  };

  // Format metric value
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Get metric label
  const getMetricLabel = () => {
    const labels: Record<string, string> = {
      fame: t('fame'),
      kills: t('kills'),
      battles: t('battle'),
    };
    return labels[metric] || metric;
  };

  // Prepare data for charts
  const chartData = factions.map((faction, index) => ({
    factionName: faction.name,
    factionId: faction.id,
    value: getMetricValue(faction),
    color: getFactionColor(faction.id, index),
    ...faction,
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom Tooltip for Pie Chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

      return (
        <div className="bg-popover border-2 border-border p-4 rounded-2xl shadow-xl min-w-[200px] animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4" style={{ color: data.color }} />
            <p className="text-foreground text-sm font-medium">{data.factionName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{getMetricLabel()}</span>
              <p className="text-primary font-bold font-mono text-xl">
                {formatValue(data.value)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{t('share')}</span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {percentage}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{t('kdRatio')}</span>
              <span className="text-foreground font-mono">
                {data.deaths > 0 ? (data.kills / data.deaths).toFixed(2) : '∞'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{t('winRate')}</span>
              <span className="text-foreground font-mono">
                {data.winRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

      return (
        <div className="bg-popover border-2 border-border p-4 rounded-2xl shadow-xl min-w-[180px] animate-scale-in">
          <p className="text-foreground text-sm font-bold mb-3">{data.factionName}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{getMetricLabel()}</span>
              <p className="text-primary font-bold font-mono text-lg">
                {formatValue(data.value)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{t('share')}</span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (!factions || factions.length === 0) {
    return (
      <ChartEmptyState
        message="No faction data available"
        subMessage="Battle data will appear here once fights are recorded"
      />
    );
  }

  // Get top 3 factions for summary
  const topFactions = [...chartData].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="bg-card/50 p-6 rounded-2xl border border-border/50 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t('factionDominanceTitle')}</h3>
            <p className="text-xs text-muted-foreground">{t('factionDominanceDesc')}</p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/50">
          <span className="text-xs text-muted-foreground">{t('totalBattleFame')}</span>
          <div className="text-lg font-bold text-primary font-mono">{formatValue(total)}</div>
        </div>
      </div>

      {showDetails ? (
        /* Detailed View - Pie Chart Left, List Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie Chart - 7 columns */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="w-full" style={{ height: '340px' }} role="img" aria-label="Faction dominance chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {chartData.map((entry, index) => (
                        <filter key={`glow-${index}`} id={`glow-${index}`}>
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="90%"
                      innerRadius="60%"
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="factionName"
                      paddingAngle={4}
                      animationDuration={1000}
                      strokeWidth={3}
                      stroke="hsl(var(--card))"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="transition-all duration-300"
                          style={{
                            filter: `url(#glow-${index})`,
                            transformOrigin: 'center',
                            transform: 'scale(1)'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1.05)';
                            (e.target as HTMLElement).style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.transform = 'scale(1)';
                            (e.target as HTMLElement).style.opacity = '0.8';
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<PieTooltip />} 
                      wrapperStyle={{ zIndex: 100 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Center Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-black text-foreground">{chartData.length}</div>
                <div className="text-xs text-muted-foreground font-medium">{t('guilds')}</div>
              </div>
            </div>
          </div>

          {/* Guild List - 5 columns */}
          <div className="lg:col-span-5 md:border-l md:border-border/50 md:pl-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-foreground">{t('allFactions')}</h4>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">
                {chartData.length} {t('total')}
              </span>
            </div>
            
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {[...chartData].sort((a, b) => b.value - a.value).map((faction, idx) => {
                const percentage = total > 0 ? ((faction.value / total) * 100).toFixed(1) : '0';
                const kdRatio = faction.deaths > 0 ? (faction.kills / faction.deaths).toFixed(2) : '∞';
                const winRate = faction.winRate.toFixed(1);
                
                return (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
                  >
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/30' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-600/30' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    
                    {/* Color Indicator */}
                    <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background" style={{ backgroundColor: faction.color, borderColor: faction.color } as React.CSSProperties} />
                    
                    {/* Faction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{faction.factionName}</span>
                        {idx < 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                            {t('top')} {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{percentage}% {t('share')}</span>
                        <span>•</span>
                        <span>{t('kdRatio')}: {kdRatio}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground font-mono">{formatValue(faction.value)}</div>
                      <div className="text-xs text-muted-foreground">{winRate}% {t('win')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Simple View - Pie Chart Only */
        <div className="w-full" style={{ height: '280px', minHeight: '250px' }} role="img" aria-label="Faction dominance chart">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  innerRadius="50%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="factionName"
                  paddingAngle={3}
                  animationDuration={800}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_STYLES.gridLine.stroke}
                opacity={CHART_STYLES.gridLine.opacity}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke={CHART_STYLES.axis.stroke}
                fontSize={11}
                tick={{ fill: CHART_STYLES.axis.stroke }}
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="factionName"
                stroke={CHART_STYLES.axis.stroke}
                fontSize={11}
                tick={{ fill: CHART_STYLES.axis.stroke }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar
                dataKey="value"
                name={getMetricLabel()}
                animationDuration={800}
                radius={[0, 6, 6, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      )}

      {/* Top 3 Factions Summary - Only show in simple mode */}
      {!showDetails && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-3">
            {topFactions.map((faction, idx) => {
              const percentage = total > 0 ? ((faction.value / total) * 100).toFixed(0) : '0';
              return (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: faction.color }} />
                    <span className="text-xs font-semibold text-foreground truncate" title={faction.factionName}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {faction.factionName}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">{formatValue(faction.value)}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
