'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { ChartEmptyState } from '../components/ChartEmptyState';
import { CHART_COLORS, CHART_GRADIENTS, CHART_STYLES } from '../lib/chart-theme';
import '../styles/premium-animations.css';

interface TimelineEntry {
  timestamp: string;
  battles: number;
  kills: number;
  fame: number;
  participants: number;
}

interface Props {
  data: TimelineEntry[];
  timeRange: '24h' | '7d' | '30d';
  metric: 'battles' | 'kills' | 'fame' | 'participants';
}

export default function BattleTimelineChart({ data, timeRange, metric }: Props) {
  // Format timestamp based on time range
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format Y-axis value based on metric
  const formatValue = (value: number) => {
    switch (metric) {
      case 'fame':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
      case 'participants':
      case 'kills':
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
      default:
        return value.toString();
    }
  };

  // Get metric label
  const getMetricLabel = () => {
    const labels: Record<string, string> = {
      battles: 'Battles',
      kills: 'Kills',
      fame: 'Fame',
      participants: 'Participants',
    };
    return labels[metric] || metric;
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-popover border-2 border-border p-4 rounded-2xl shadow-xl min-w-[180px] animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground text-xs font-medium">
              {new Date(label).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">{getMetricLabel()}</span>
              </div>
              <p className="text-primary font-bold font-mono text-lg">
                {formatValue(data[metric])}
              </p>
            </div>

            {/* Show additional metrics for context */}
            {metric !== 'battles' && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Battles</span>
                <span className="text-sm font-mono text-foreground">{data.battles}</span>
              </div>
            )}

            {metric !== 'kills' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Kills</span>
                <span className="text-sm font-mono text-foreground">{formatValue(data.kills)}</span>
              </div>
            )}

            {metric !== 'fame' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Fame</span>
                <span className="text-sm font-mono text-foreground">{formatValue(data.fame)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState
        message="No battle data available"
        subMessage="Try adjusting your filters or time range"
      />
    );
  }

  return (
    <div className="bg-card/50 p-4 sm:p-6 rounded-2xl border border-border/50 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Battle Timeline</h3>
            <p className="text-xs text-muted-foreground">
              {getMetricLabel()} over {timeRange === '24h' ? 'last 24 hours' : timeRange === '7d' ? 'last 7 days' : 'last 30 days'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary/40" />
            <span className="text-muted-foreground">{getMetricLabel()}</span>
          </div>
        </div>
      </div>

      <div className="w-full" style={{ height: '280px', minHeight: '250px' }} role="img" aria-label="Battle timeline chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_GRADIENTS.primary.start} stopOpacity={0.5} />
                <stop offset="50%" stopColor={CHART_GRADIENTS.primary.start} stopOpacity={0.2} />
                <stop offset="100%" stopColor={CHART_GRADIENTS.primary.end} stopOpacity={0} />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_STYLES.gridLine.stroke}
              opacity={CHART_STYLES.gridLine.opacity}
              vertical={false}
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke={CHART_STYLES.axis.stroke}
              fontSize={11}
              tick={{ fill: CHART_STYLES.axis.stroke }}
              axisLine={false}
              tickLine={false}
              minTickGap={50}
              interval="equidistantPreserveStart"
              dy={10}
            />

            <YAxis
              domain={['auto', 'auto']}
              stroke={CHART_STYLES.axis.stroke}
              fontSize={11}
              tick={{ fill: CHART_STYLES.axis.stroke }}
              tickFormatter={formatValue}
              width={50}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: CHART_COLORS.primary,
                strokeWidth: 2,
                strokeDasharray: '5 5',
                opacity: 0.5
              }}
              isAnimationActive={true}
              wrapperStyle={{ outline: 'none' }}
            />

            <Area
              type="monotone"
              dataKey={metric}
              name={getMetricLabel()}
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMetric)"
              animationDuration={800}
              activeDot={{
                r: 8,
                strokeWidth: 2,
                stroke: '#fff',
                fill: CHART_COLORS.primary
              }}
              filter="url(#glow)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
