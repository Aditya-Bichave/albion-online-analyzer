'use client';

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { MapPin, Crown, Shield, TrendingUp } from 'lucide-react';
import { ChartEmptyState } from '../components/ChartEmptyState';
import { CHART_COLORS, CHART_STYLES, getFactionColor } from '../lib/chart-theme';
import type { ZoneStat } from '../types';

// Extend ZoneStat with computed fields
interface ZoneData extends ZoneStat {
  color: string;
  fillOpacity: number;
}

interface Props {
  zones: ZoneStat[];
}

export default function ZoneControlHeatmap({ zones }: Props) {
  // Prepare data for treemap
  const chartData = zones.map((zone, index) => {
    // Determine faction color
    const color = zone.controllingFaction 
      ? getFactionColor(zone.controllingFaction, index)
      : CHART_COLORS.muted;
    
    return {
      name: zone.zoneName,
      value: zone.battleCount,
      battles: zone.battleCount,
      kills: zone.totalKills,
      fame: zone.totalFame,
      controllingFaction: zone.controllingFaction || 'Neutral',
      strategicValue: zone.strategicValue || 'medium',
      color,
      fillOpacity: zone.strategicValue === 'high' ? 1 : zone.strategicValue === 'medium' ? 0.8 : 0.6,
    };
  });

  // Sort by battle count (largest first)
  chartData.sort((a, b) => b.value - a.value);

  // Calculate total battles
  const totalBattles = chartData.reduce((sum, zone) => sum + zone.battles, 0);

  // Get strategic value color
  const getStrategicValueColor = (value: string) => {
    switch (value) {
      case 'critical': return CHART_COLORS.destructive;
      case 'high': return CHART_COLORS.primary;
      case 'medium': return CHART_COLORS.warning;
      case 'low': return CHART_COLORS.success;
      default: return CHART_COLORS.muted;
    }
  };

  // Format value
  const formatValue = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalBattles > 0 ? ((data.battles / totalBattles) * 100).toFixed(1) : '0';
      const strategicColor = getStrategicValueColor(data.strategicValue);
      
      return (
        <div className="bg-popover border-2 border-border p-4 rounded-2xl shadow-xl min-w-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" style={{ color: data.color }} />
            <p className="text-foreground text-sm font-bold">{data.name}</p>
          </div>
          
          <div className="space-y-2">
            {/* Faction Control */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Control</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: data.color }}>
                {data.controllingFaction}
              </span>
            </div>
            
            {/* Battle Count */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Battles</span>
              <p className="text-primary font-black font-mono text-lg">
                {formatValue(data.battles)}
              </p>
            </div>
            
            {/* Percentage */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Share</span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {percentage}%
              </span>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Kills</span>
                <span className="text-xs font-mono text-foreground">
                  {formatValue(data.kills)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Fame</span>
                <span className="text-xs font-mono text-foreground">
                  {formatValue(data.fame)}
                </span>
              </div>
            </div>
            
            {/* Strategic Value */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Strategic</span>
              </div>
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${strategicColor}20`,
                  color: strategicColor,
                }}
              >
                {data.strategicValue.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom content for each treemap cell
  const CustomContent = ({ root, depth, x, y, width, height, index, name, color, value }: any) => {
    // Only show labels for larger boxes
    const showLabel = width > 100 && height > 40;
    const showValue = width > 120 && height > 50;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            fillOpacity: 0.8,
            stroke: 'hsl(var(--border))',
            strokeWidth: 1,
            cursor: 'pointer',
          }}
        />
        {showLabel && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 10}
            textAnchor="middle"
            fill="hsl(var(--popover-foreground))"
            fontSize={width > 150 ? 14 : 12}
            fontWeight="600"
          >
            {name.length > 20 ? name.substring(0, 18) + '...' : name}
          </text>
        )}
        {showValue && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="hsl(var(--popover-foreground))"
            fontSize={11}
          >
            {formatValue(value)} battles
          </text>
        )}
      </g>
    );
  };

  // Empty state
  if (!zones || zones.length === 0) {
    return (
      <ChartEmptyState 
        message="No zone control data"
        subMessage="Zone statistics will appear here once battles are recorded"
        icon={<MapPin className="h-16 w-16 mb-4 opacity-20" />}
      />
    );
  }

  return (
    <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Zone Control</h3>
            <p className="text-xs text-muted-foreground">
              Territory control by battle frequency
            </p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Total battles:{' '}
          <span className="font-mono text-foreground">{formatValue(totalBattles)}</span>
        </div>
      </div>

      <div className="h-[450px] md:h-[500px] w-full" role="img" aria-label="Zone control heatmap">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={chartData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="hsl(var(--border))"
            fill="#8884d8"
            animationDuration={800}
            content={<CustomContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.slice(0, 8).map((zone, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30"
            title={zone.name}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
              {zone.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {zone.battles}
            </span>
          </div>
        ))}
        {chartData.length > 8 && (
          <div className="text-xs text-muted-foreground px-3 py-1.5">
            +{chartData.length - 8} more
          </div>
        )}
      </div>
    </div>
  );
}
