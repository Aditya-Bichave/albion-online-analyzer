'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Users } from 'lucide-react';
import { ChartEmptyState } from '../components/ChartEmptyState';
import { CHART_COLORS, CHART_STYLES, getPlayerColor } from '../lib/chart-theme';
import type { PlayerStats } from '../types';

interface Props {
  players: PlayerStats[];
  maxPlayers?: number;
}

export default function PlayerPerformanceChart({ players, maxPlayers = 5 }: Props) {
  // Limit players to maxPlayers
  const limitedPlayers = players.slice(0, maxPlayers);

  // Normalize stats for radar chart (0-100 scale)
  const normalizeStat = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  // Calculate max values for normalization
  const maxStats = limitedPlayers.reduce(
    (acc, player) => ({
      kills: Math.max(acc.kills, player.totalKills),
      deaths: Math.max(acc.deaths, player.totalDeaths),
      fame: Math.max(acc.fame, player.totalFame),
      kd: Math.max(acc.kd, player.kdRatio),
      battles: Math.max(acc.battles, player.battlesParticipated),
    }),
    { kills: 0, deaths: 0, fame: 0, kd: 0, battles: 0 }
  );

  // Prepare radar chart data
  const radarData = [
    {
      stat: 'Kills',
      fullMark: 100,
      ...limitedPlayers.reduce((acc, player, index) => {
        acc[`player${index}`] = normalizeStat(player.totalKills, maxStats.kills);
        return acc;
      }, {} as Record<string, number>),
    },
    {
      stat: 'Deaths',
      fullMark: 100,
      ...limitedPlayers.reduce((acc, player, index) => {
        acc[`player${index}`] = normalizeStat(player.totalDeaths, maxStats.deaths);
        return acc;
      }, {} as Record<string, number>),
    },
    {
      stat: 'Fame',
      fullMark: 100,
      ...limitedPlayers.reduce((acc, player, index) => {
        acc[`player${index}`] = normalizeStat(player.totalFame, maxStats.fame);
        return acc;
      }, {} as Record<string, number>),
    },
    {
      stat: 'K/D Ratio',
      fullMark: 100,
      ...limitedPlayers.reduce((acc, player, index) => {
        acc[`player${index}`] = normalizeStat(player.kdRatio, maxStats.kd);
        return acc;
      }, {} as Record<string, number>),
    },
    {
      stat: 'Battles',
      fullMark: 100,
      ...limitedPlayers.reduce((acc, player, index) => {
        acc[`player${index}`] = normalizeStat(player.battlesParticipated, maxStats.battles);
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Format value for display
  const formatValue = (value: number, stat: string) => {
    switch (stat) {
      case 'Fame':
        if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString();
      case 'K/D Ratio':
        return value.toFixed(2);
      default:
        return value.toLocaleString();
    }
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const stat = payload[0]?.payload?.stat;
      
      return (
        <div className="bg-popover border-2 border-border p-4 rounded-2xl shadow-xl min-w-[200px]">
          <p className="text-foreground text-sm font-bold mb-3">{stat}</p>
          
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const player = limitedPlayers[index];
              if (!player) return null;
              
              const rawValue = stat === 'Kills' ? player.totalKills :
                               stat === 'Deaths' ? player.totalDeaths :
                               stat === 'Fame' ? player.totalFame :
                               stat === 'K/D Ratio' ? player.kdRatio :
                               player.battlesParticipated;
              
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.stroke }}
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-foreground">
                    {formatValue(rawValue, stat)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const player = limitedPlayers[index];
          if (!player) return null;
          
          return (
            <div 
              key={`legend-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {player.name}
              </span>
              {player.guildName && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  [{player.guildName}]
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Empty state
  if (!limitedPlayers || limitedPlayers.length === 0) {
    return (
      <ChartEmptyState 
        message="No player data available"
        subMessage="Top players will appear here once battles are recorded"
        icon={<Target className="h-16 w-16 mb-4 opacity-20" />}
      />
    );
  }

  return (
    <div className="bg-card/50 p-6 rounded-2xl border border-border/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Player Performance</h3>
            <p className="text-xs text-muted-foreground">
              Multi-stat comparison (top {limitedPlayers.length} players)
            </p>
          </div>
        </div>
      </div>

      <div className="h-[400px] md:h-[450px] w-full" role="img" aria-label="Player performance radar chart">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid 
              stroke={CHART_STYLES.gridLine.stroke}
              opacity={CHART_STYLES.gridLine.opacity}
            />
            <PolarAngleAxis 
              dataKey="stat" 
              tick={{ 
                fill: CHART_STYLES.axis.stroke, 
                fontSize: CHART_STYLES.axis.fontSize,
                fontWeight: 600,
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {limitedPlayers.map((player, index) => (
              <Radar
                key={`radar-${index}`}
                name={player.name}
                dataKey={`player${index}`}
                stroke={getPlayerColor(index)}
                strokeWidth={2}
                fill={getPlayerColor(index)}
                fillOpacity={0.3}
                animationDuration={800}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2, 
                  stroke: '#fff',
                  fill: getPlayerColor(index),
                }}
              />
            ))}
            
            <Legend content={<CustomLegend />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
