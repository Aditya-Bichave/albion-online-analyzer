'use client';

import { Shield, Users, TrendingUp, Award, Swords } from 'lucide-react';
import { Battle, BattleSide } from '../types';
import { getBattleSides, calculateDominance } from '../utils';
import '../styles/premium-animations.css';

interface Props {
  battle: Battle;
  t: (key: string) => string;
}

export default function FactionComparison({ battle, t }: Props) {
  const sides = getBattleSides(battle);

  if (sides.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-muted/20 rounded-2xl mb-6 border border-border/50 animate-fade-in">
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-bold">{t('noDetails')}</p>
        <p className="text-xs opacity-70 mt-1">{t('recentBattleNote')}</p>
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fade-in-up">
      {/* Faction Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {sides.slice(0, 2).map((side, idx) => (
          <FactionCard
            key={side.id}
            side={side}
            totalFame={battle.totalFame}
            index={idx}
            t={t}
          />
        ))}
      </div>

      {/* Dominance Bar */}
      {sides.length >= 2 && (
        <DominanceBar side1={sides[0]} side2={sides[1]} totalFame={battle.totalFame} />
      )}
    </div>
  );
}

interface FactionCardProps {
  side: BattleSide;
  totalFame: number;
  index: number;
  t: (key: string) => string;
}

function FactionCard({ side, totalFame, index, t }: FactionCardProps) {
  const dominance = calculateDominance(side.killFame, totalFame);
  const isWinning = index === 0; // Assuming first side is winning if dominance is higher

  return (
    <div className={`
      relative overflow-hidden
      rounded-2xl p-4 sm:p-5
      border transition-all duration-500
      hover:scale-102 hover:shadow-xl
      animate-fade-in-left
    `} style={{ 
      animationDelay: `${index * 100}ms`,
      backgroundColor: isWinning ? 'hsl(var(--success) / 0.05)' : 'hsl(var(--destructive) / 0.05)',
      borderColor: isWinning ? 'hsl(var(--success) / 0.2)' : 'hsl(var(--destructive) / 0.2)'
    }}>
      {/* Winning Indicator */}
      {isWinning && dominance > 50 && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 text-success text-xs font-medium">
            <Award className="h-3.5 w-3.5" />
            Leading
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 pr-16">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground font-medium mb-1.5">
            {side.type === 'guild' ? t('guild') : t('alliance')}
          </div>
          <div className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
            <Shield className={`h-5 w-5 flex-shrink-0 ${isWinning ? 'text-success' : 'text-destructive'}`} />
            <span className="truncate">{side.name}</span>
            {side.tag && (
              <span className="text-sm font-normal text-muted-foreground flex-shrink-0">
                [{side.tag}]
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1.5 truncate">
            {side.participants.slice(0, 3).join(', ')}
            {side.participants.length > 3 && ` +${side.participants.length - 3}`}
          </div>
        </div>

        {/* Dominance Percentage */}
        <div className="text-right">
          <div className={`text-3xl sm:text-4xl font-mono font-bold ${isWinning ? 'text-success' : 'text-destructive'}`}>
            {dominance.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {t('dominance')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatBox
          label={t('kills')}
          value={side.kills}
          icon={<Swords className="h-3 w-3" />}
          color="text-success"
          bg="bg-success/10"
        />
        <StatBox
          label={t('deaths')}
          value={side.deaths}
          icon={<Shield className="h-3 w-3" />}
          color="text-destructive"
          bg="bg-destructive/10"
        />
        <StatBox
          label={t('players')}
          value={side.playerCount}
          icon={<Users className="h-3 w-3" />}
          color="text-info"
          bg="bg-info/10"
        />
        <StatBox
          label={t('avgIp')}
          value={side.averageIp || 'N/A'}
          icon={<Award className="h-3 w-3" />}
          color="text-warning"
          bg="bg-warning/10"
        />
      </div>

      {/* K/D Ratio */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {t('kdRatio')}
          </span>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-3.5 w-3.5 ${side.kills > side.deaths ? 'text-success' : 'text-destructive'}`} />
            <span className={`font-mono font-bold ${side.kills > side.deaths ? 'text-success' : 'text-destructive'}`}>
              {side.deaths > 0 ? (side.kills / side.deaths).toFixed(2) : '∞'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color, bg }: any) {
  return (
    <div className={`
      ${bg} rounded-lg p-2
      transition-all duration-300
      hover:scale-105
    `}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={color}>{icon}</div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className={`font-mono font-bold text-sm ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function DominanceBar({ side1, side2, totalFame }: any) {
  const dominance1 = calculateDominance(side1.killFame, totalFame);
  const dominance2 = calculateDominance(side2.killFame, totalFame);

  return (
    <div className="animate-fade-in-up delay-200">
      {/* Bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-muted/30">
        <div
          className="bg-gradient-to-r from-success to-success/80 transition-all duration-1000 ease-out relative"
          style={{ width: `${dominance1}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </div>
        <div
          className="bg-gradient-to-r from-destructive/80 to-destructive transition-all duration-1000 ease-out relative"
          style={{ width: `${dominance2}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center mt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="font-bold text-foreground">{side1.name}</span>
          <span className="font-mono font-black text-success">{dominance1.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-destructive">{dominance2.toFixed(1)}%</span>
          <span className="font-bold text-foreground">{side2.name}</span>
          <div className="w-3 h-3 rounded-full bg-destructive" />
        </div>
      </div>
    </div>
  );
}
