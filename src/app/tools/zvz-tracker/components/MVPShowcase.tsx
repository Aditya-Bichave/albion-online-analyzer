'use client';

import { Trophy, Swords, Shield, Crown, Medal, Star } from 'lucide-react';
import { Battle } from '../types';
import '../styles/premium-animations.css';

interface Props {
  battle: Battle;
  t: (key: string) => string;
}

export default function MVPShowcase({ battle, t }: Props) {
  const players = Object.values(battle.players || {});

  const topFame = [...players].sort((a: any, b: any) => (b.killFame || 0) - (a.killFame || 0))[0];
  const topKiller = [...players].sort((a: any, b: any) => (b.kills || 0) - (a.kills || 0))[0];
  const topIp = [...players].sort((a: any, b: any) => (Number(b.averageItemPower) || 0) - (Number(a.averageItemPower) || 0))[0];

  const guilds = Object.values(battle.guilds || {});
  const efficientGuilds = [...guilds]
    .filter((g: any) => g.kills >= 5)
    .sort((a: any, b: any) => {
      const kdA = a.deaths > 0 ? a.kills / a.deaths : a.kills;
      const kdB = b.deaths > 0 ? b.kills / b.deaths : b.kills;
      return kdB - kdA;
    })
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* MVP Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MVPCard
          title={t('mvpFame')}
          player={topFame}
          value={topFame?.killFame || 0}
          label={t('fame')}
          icon={<Trophy />}
          color="warning"
          gradient="from-warning/20 to-warning/10"
          rank={1}
          t={t}
        />

        <MVPCard
          title={t('topKiller')}
          player={topKiller}
          value={topKiller?.kills || 0}
          label={t('kills')}
          icon={<Swords />}
          color="destructive"
          gradient="from-destructive/20 to-destructive/10"
          rank={2}
          t={t}
        />

        <MVPCard
          title={t('highestIp')}
          player={topIp}
          value={topIp?.averageItemPower || 0}
          label="IP"
          icon={<Shield />}
          color="info"
          gradient="from-info/20 to-info/10"
          rank={3}
          t={t}
        />
      </div>

      {/* Guild Efficiency */}
      {efficientGuilds.length > 0 && (
        <div className="animate-fade-in-up delay-100">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" />
            {t('deadliestGuilds')} (Min 5 kills)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {efficientGuilds.map((guild: any, idx: number) => (
              <EfficiencyCard key={guild.id} guild={guild} rank={idx + 1} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MVPCardProps {
  title: string;
  player: any;
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  rank: number;
  t: (key: string) => string;
}

function MVPCard({ title, player, value, label, icon, color, gradient, rank, t }: MVPCardProps) {
  if (!player) {
    return (
      <div className="bg-card/50 border border-border p-6 rounded-2xl">
        <p className="text-muted-foreground text-center">{t('noData')}</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`
      relative group overflow-hidden
      bg-card/50 backdrop-blur-sm
      border border-border/50
      rounded-2xl p-5
      transition-all duration-500
      hover:scale-105 hover:shadow-xl
      animate-scale-in-bounce
    `}>
      {/* Gradient Background */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-br ${gradient}
      `} />

      {/* Rank Badge */}
      <div className="absolute top-3 right-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${rank === 1 ? 'bg-warning/20 text-warning' : ''}
          ${rank === 2 ? 'bg-muted/30 text-foreground' : ''}
          ${rank === 3 ? 'bg-amber-700/20 text-amber-700' : ''}
        `}>
          {rank === 1 ? <Crown className="h-4 w-4" /> : <span className="text-sm font-black">{rank}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`
          inline-flex p-2.5 rounded-xl
          bg-muted/30 group-hover:bg-muted/50
          transition-all duration-300
          mb-3 group-hover:scale-110
        `}>
          <div className={`text-${color}`}>{icon}</div>
        </div>

        {/* Title */}
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </div>

        {/* Player Avatar/Initials */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            bg-gradient-to-br from-primary/20 to-primary/10
            border-2 border-primary/30
            text-primary font-black text-sm
          `}>
            {getInitials(player.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black text-foreground truncate" title={player.name}>
              {player.name}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={player.guildName}>
              {player.guildName || 'No Guild'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-end justify-between">
            <div className={`text-3xl font-mono font-black text-${color}`}>
              {formatNumber(value)}
            </div>
            <div className="text-xs text-muted-foreground font-bold uppercase">
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className={`
        absolute -bottom-4 -right-4 w-24 h-24 rounded-full
        bg-gradient-to-br from-${color}/20 to-transparent
        opacity-0 group-hover:opacity-50
        transition-opacity duration-500
        blur-2xl
      `} />
    </div>
  );
}

function EfficiencyCard({ guild, rank, t }: { guild: any; rank: number; t: (key: string) => string }) {
  const kd = guild.deaths > 0 ? guild.kills / guild.deaths : guild.kills;

  return (
    <div className={`
      bg-card/50 border border-border/50
      rounded-xl p-3
      transition-all duration-300
      hover:scale-105 hover:shadow-lg hover:border-primary/30
      animate-fade-in-up
    `} style={{ animationDelay: `${rank * 50}ms` }}>
      {/* Rank */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`
          w-5 h-5 rounded-full flex items-center justify-center
          text-xs font-black
          ${rank === 1 ? 'bg-warning text-warning-foreground' : ''}
          ${rank === 2 ? 'bg-muted text-foreground' : ''}
          ${rank === 3 ? 'bg-amber-700 text-amber-100' : ''}
          ${rank > 3 ? 'bg-muted/30 text-muted-foreground' : ''}
        `}>
          {rank}
        </div>
        <Star className={`h-3 w-3 ${rank <= 3 ? 'text-warning' : 'text-muted-foreground'}`} />
      </div>

      {/* Guild Name */}
      <div className="font-bold text-sm truncate mb-1" title={guild.name}>
        {guild.name}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground mb-1.5">
        {guild.kills}K / {guild.deaths}D
      </div>
      <div className="font-mono font-black text-success text-sm">
        {kd.toFixed(1)} K/D
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  if (!num) return '0';
  return num.toLocaleString();
}
