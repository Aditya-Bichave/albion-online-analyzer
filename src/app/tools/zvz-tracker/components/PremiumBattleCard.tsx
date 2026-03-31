'use client';

import { useEffect, useState } from 'react';
import { Swords, Clock, Users, Skull, ChevronDown, ChevronUp, Share2, TrendingUp, Award, Zap } from 'lucide-react';
import { Battle } from '../types';
import '../styles/premium-animations.css';

interface Props {
  battle: Battle;
  isExpanded: boolean;
  onExpand: () => void;
  isLive: boolean;
  onCopyLink: () => void;
  formatTimeAgo: (date: string) => string;
  t: (key: string) => string;
  lastUpdate?: number;
  showLiveIndicator?: boolean;
}

export default function PremiumBattleCard({
  battle,
  isExpanded,
  onExpand,
  isLive,
  onCopyLink,
  formatTimeAgo,
  t,
  lastUpdate,
  showLiveIndicator = false
}: Props) {
  const playerCount = Object.keys(battle.players || {}).length;
  const [prevKills, setPrevKills] = useState(battle.totalKills);
  const [prevFame, setPrevFame] = useState(battle.totalFame);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (battle.totalKills > prevKills || battle.totalFame > prevFame) {
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 2000);

      setPrevKills(battle.totalKills);
      setPrevFame(battle.totalFame);
    }
  }, [battle.totalKills, battle.totalFame, prevKills, prevFame]);

  // Calculate faction dominance for preview
  const factions = Object.values(battle.guilds || {});
  const totalFame = battle.totalFame || 1;
  const redFame = factions
    .filter(g => g.allianceId === '1' || g.name.toLowerCase().includes('red'))
    .reduce((sum, g) => sum + g.killFame, 0);
  const blueFame = factions
    .filter(g => g.allianceId === '2' || g.name.toLowerCase().includes('blue'))
    .reduce((sum, g) => sum + g.killFame, 0);
  
  const redPercentage = ((redFame / totalFame) * 100).toFixed(0);
  const bluePercentage = ((blueFame / totalFame) * 100).toFixed(0);

  return (
    <div
      id={`battle-${battle.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-500
        ${isExpanded 
          ? 'border-2 border-destructive shadow-lg shadow-destructive/20' 
          : 'border border-border/50 hover:border-primary/50'
        }
        ${isFlashing ? 'ring-2 ring-success animate-pulse' : ''}
        ${isLive ? 'animate-glow' : ''}
        bg-card/80 backdrop-blur-sm
      `}
    >
      {/* Gradient Background Overlay */}
      <div className={`
        absolute inset-0 opacity-0 transition-opacity duration-500
        ${isLive ? 'opacity-100 gradient-overlay-red' : ''}
        ${isHovered && !isLive ? 'opacity-50 gradient-overlay-amber' : ''}
      `} />

      {/* Live Indicator Pulse */}
      {isLive && (
        <div className="absolute top-0 right-0 p-3">
          <div className="relative">
            <div className="absolute inset-0 animate-ping-slow bg-destructive rounded-full opacity-75" />
            <div className="relative w-3 h-3 bg-destructive rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div
        className="relative p-4 md:p-5 cursor-pointer transition-colors duration-300 hover:bg-muted/30"
        onClick={onExpand}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* Left Side: Battle Info */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            {/* Icon */}
            <div className={`
              p-2.5 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0
              ${isLive 
                ? 'bg-destructive/10 text-destructive animate-pulse' 
                : 'bg-muted/20 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }
            `}>
              <Swords className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            {/* Battle Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-black text-foreground text-base sm:text-lg truncate">
                  {t('battle')} #{battle.id}
                </span>
                {isLive && (
                  <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-xs font-black rounded-full animate-pulse shadow-lg shadow-destructive/30">
                    {t('live')}
                  </span>
                )}
                {showLiveIndicator && isFlashing && (
                  <span className="px-2.5 py-1 bg-success text-success-foreground text-xs font-black rounded-full animate-pulse shadow-lg shadow-success/30">
                    <Zap className="h-3 w-3 inline mr-1" />
                    {t('liveUpdate')}
                  </span>
                )}
              </div>

              {/* Battle Stats Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 
                  <span className="font-medium">{formatTimeAgo(battle.startTime)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 
                  <span className="font-medium">{playerCount} {t('players')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Skull className="h-3.5 w-3.5" /> 
                  <span className="font-medium">{battle.totalKills} {t('kills')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Fame & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Fame Display */}
            <div className="flex-1 sm:flex-initial text-right pr-4 border-r border-border/50">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                {t('totalFame')}
              </div>
              <div className="font-mono font-black text-lg sm:text-xl text-warning flex items-center justify-end gap-1">
                {formatNumber(battle.totalFame)}
                {isFlashing && <TrendingUp className="h-4 w-4 text-success animate-bounce" />}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
              className="p-2.5 hover:bg-background rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg"
              title={t('shareBattle')}
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Expand Arrow */}
            <div className={`
              p-2 rounded-xl transition-all duration-300
              ${isExpanded ? 'bg-primary text-primary-foreground rotate-180' : 'text-muted-foreground hover:bg-muted'}
            `}>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>

        {/* Faction Bar Preview */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground font-bold uppercase tracking-wider">
              {t('factionBalance')}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-red-500 font-bold">{redPercentage}%</span>
              <span className="text-blue-500 font-bold">{bluePercentage}%</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-muted/30 flex">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000 ease-out"
              style={{ width: `${redPercentage}%` }}
            />
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${bluePercentage}%` }}
            />
          </div>
        </div>

        {/* Hover Stats Preview */}
        <div className={`
          mt-4 grid grid-cols-3 gap-2 sm:gap-3 transition-all duration-300 overflow-hidden
          ${isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}
        `}>
          <StatPreview
            icon={<Award className="h-3.5 w-3.5" />}
            label={t('avgIP')}
            value={calculateAvgIP(battle.players)}
            color="text-info"
          />
          <StatPreview
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label={t('killsPerMin')}
            value={calculateKillsPerMin(battle)}
            color="text-success"
          />
          <StatPreview
            icon={<Users className="h-3.5 w-3.5" />}
            label={t('guilds')}
            value={Object.keys(battle.guilds || {}).length.toString()}
            color="text-primary"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Preview Component
function StatPreview({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-muted/20 rounded-lg p-2 text-center">
      <div className={`flex items-center justify-center mb-0.5 ${color}`}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground font-medium mb-0.5">{label}</div>
      <div className="text-sm font-black text-foreground">{value}</div>
    </div>
  );
}

// Helper Functions
function formatNumber(num: number | undefined | null) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function calculateAvgIP(players: Record<string, any>): string {
  const playerArray = Object.values(players);
  if (playerArray.length === 0) return '0';
  
  const total = playerArray.reduce((sum: number, p: any) => {
    return sum + (Number(p.averageItemPower) || 0);
  }, 0);
  
  const avg = total / playerArray.length;
  return Math.round(avg).toLocaleString();
}

function calculateKillsPerMin(battle: Battle): string {
  const startTime = new Date(battle.startTime).getTime();
  const now = Date.now();
  const minutesDiff = (now - startTime) / 1000 / 60;
  
  if (minutesDiff < 1) return battle.totalKills.toString();
  return (battle.totalKills / minutesDiff).toFixed(1);
}
