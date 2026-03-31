'use client';

import { Clock, Skull, Users, ChevronRight, Sword, Shield, Share2 } from 'lucide-react';
import { Event } from '../types';
import { ItemIcon } from '@/components/ItemIcon';

interface KillCardProps {
  event: Event;
  onClick: () => void;
  formatTimeAgo: (date: string) => string;
  formatCompactNumber: (num: number) => string;
  t: (key: string) => string;
  onShare?: (event: Event, e: React.MouseEvent) => void;
}

export function KillCard({ event, onClick, formatTimeAgo, formatCompactNumber, t, onShare }: KillCardProps) {
  const killerIp = event.Killer.AverageItemPower;
  const victimIp = event.Victim.AverageItemPower;
  const ipDiff = killerIp - victimIp;
  const ipDiffPercent = victimIp > 0 ? Math.round((ipDiff / victimIp) * 100) : 0;
  const ipDiffRounded = Math.round(Math.abs(ipDiff));

  const isStomp = ipDiffPercent > 20;
  const isFairFight = Math.abs(ipDiffPercent) < 10;
  const participantCount = event.Participants?.length || 1;

  const getKillType = () => {
    if (participantCount === 1) return { label: t('soloKill'), color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (participantCount >= 5) return { label: t('zvzLargeScale'), color: 'text-red-500', bg: 'bg-red-500/10' };
    if (isStomp) return { label: t('stomp'), color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: t('groupGank'), color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  const killType = getKillType();

  return (
    <div
      onClick={onClick}
      className="group relative bg-card hover:bg-accent/50 border border-border hover:border-primary/50 rounded-xl p-3 sm:p-4 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 animate-in fade-in slide-in-from-top-2"
    >
      {/* Kill Type Badge - Top-right */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${killType.bg} ${killType.color} whitespace-nowrap`}>
          {killType.label}
        </span>
      </div>

      {/* Action Buttons - Share (below kill type badge) */}
      {onShare && (
        <div className="absolute top-8 right-2 sm:top-9 sm:right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(event, e);
            }}
            className="p-1.5 rounded-lg bg-background/80 hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
            title={t('shareKill')}
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* Main Content - Stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        {/* Killer Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full flex items-center justify-center shrink-0">
              <Skull className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-green-500 text-sm sm:text-base truncate">{event.Killer.Name}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {event.Killer.GuildName || t('noGuild')}
                {event.Killer.AllianceName && <span className="hidden sm:inline"> [{event.Killer.AllianceName}]</span>}
              </div>
            </div>
          </div>

          {/* Killer Equipment Preview */}
          <div className="flex items-center gap-1 mt-2">
            {event.Killer.Equipment.MainHand && (
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-muted rounded p-0.5">
                <ItemIcon item={{ Type: event.Killer.Equipment.MainHand.Type }} size={16} />
              </div>
            )}
            {event.Killer.Equipment.Armor && (
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-muted rounded p-0.5">
                <ItemIcon item={{ Type: event.Killer.Equipment.Armor.Type }} size={16} />
              </div>
            )}
          </div>
        </div>

        {/* VS Badge - Centered */}
        <div className="flex items-center justify-center w-full sm:w-auto shrink-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <Sword className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
          </div>
        </div>

        {/* Victim Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full flex items-center justify-center shrink-0">
              <Skull className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-red-500 text-sm sm:text-base truncate">{event.Victim.Name}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {event.Victim.GuildName || t('noGuild')}
                {event.Victim.AllianceName && <span className="hidden sm:inline"> [{event.Victim.AllianceName}]</span>}
              </div>
            </div>
          </div>

          {/* Victim Equipment Preview */}
          <div className="flex items-center gap-1 mt-2">
            {event.Victim.Equipment.MainHand && (
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-muted rounded p-0.5">
                <ItemIcon item={{ Type: event.Victim.Equipment.MainHand.Type }} size={16} />
              </div>
            )}
            {event.Victim.Equipment.Armor && (
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-muted rounded p-0.5">
                <ItemIcon item={{ Type: event.Victim.Equipment.Armor.Type }} size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar - Stacked on mobile, row on desktop */}
      <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="text-[11px] sm:text-xs">{formatTimeAgo(event.TimeStamp)}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-500">
            <Sword className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="font-mono font-bold text-[11px] sm:text-xs">{formatCompactNumber(event.TotalVictimKillFame)}</span>
          </div>

          {participantCount > 1 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="text-[11px] sm:text-xs">{participantCount} {t('participants')}</span>
            </div>
          )}
        </div>

        {/* IP Advantage - Rounded numbers */}
        <div className={`flex items-center gap-0.5 sm:gap-1 font-mono font-bold text-[10px] sm:text-xs ${
          ipDiff > 0 ? 'text-green-500' : ipDiff < 0 ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {ipDiff > 0 ? '↑' : ipDiff < 0 ? '↓' : '='}
          <span className="whitespace-nowrap">{ipDiffRounded}</span>
          <span className="text-[9px] sm:text-[10px]">({ipDiffPercent}%)</span>
        </div>
      </div>

      {/* Hover Arrow - Hidden on mobile */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
        <ChevronRight className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
}
