'use client';

import { useEffect, useState } from 'react';
import { Swords, Clock, Users, Skull, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Battle } from '../types';

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

export default function BattleCard({
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

  useEffect(() => {
    if (battle.totalKills > prevKills || battle.totalFame > prevFame) {
      // Flash effect on update
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 2000);
      
      setPrevKills(battle.totalKills);
      setPrevFame(battle.totalFame);
    }
  }, [battle.totalKills, battle.totalFame, prevKills, prevFame]);

  return (
    <div 
      id={`battle-${battle.id}`}
      className={`bg-card/80 border ${
        isExpanded ? 'border-destructive ring-1 ring-destructive' : 'border-destructive/30'
      } rounded-xl overflow-hidden transition-all duration-300 hover:border-destructive/50 ${
        isFlashing ? 'ring-2 ring-success ring-offset-2' : ''
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onExpand}
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-lg ${isLive ? 'bg-destructive/10 text-destructive' : 'bg-muted/20 text-muted-foreground'}`}>
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-foreground text-lg">
                  {t('battle')} #{battle.id}
                </span>
                {isLive && (
                  <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full animate-pulse">
                    {t('live')}
                  </span>
                )}
                {showLiveIndicator && isFlashing && (
                  <span className="px-2 py-0.5 bg-success text-success-foreground text-xs font-bold rounded-full animate-pulse">
                    Live Update
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatTimeAgo(battle.startTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {playerCount} {t('players')}
                </span>
                <span className="flex items-center gap-1">
                  <Skull className="h-3 w-3" /> {battle.totalKills} {t('kills')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex-1 md:flex-initial text-right pr-4 border-r border-border">
              <div className="text-xs text-muted-foreground uppercase">{t('totalFame')}</div>
              <div className="font-mono font-bold text-warning">{formatNumber(battle.totalFame)}</div>
            </div>
            <button
              onClick={onCopyLink}
              className="p-2 hover:bg-background rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title={t('shareBattle')}
            >
              <Share2 className="h-4 w-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content will be handled by BattleDetails component */}
    </div>
  );
}

function formatNumber(num: number | undefined | null) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}
