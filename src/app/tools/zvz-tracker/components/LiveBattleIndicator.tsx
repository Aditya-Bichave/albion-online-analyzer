'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  lastRefresh: number;
  hasLiveBattles: boolean;
  onRefresh?: () => void;
}

export default function LiveBattleIndicator({ lastRefresh, hasLiveBattles, onRefresh }: Props) {
  const t = useTranslations('ZvzTracker');
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateSecondsAgo = () => {
      const now = Date.now();
      const diff = Math.floor((now - lastRefresh) / 1000);
      setSecondsAgo(diff);
    };

    updateSecondsAgo();
    const interval = setInterval(updateSecondsAgo, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  if (!hasLiveBattles) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        {secondsAgo < 5 && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            secondsAgo < 10 ? 'bg-success' : secondsAgo < 30 ? 'bg-warning' : 'bg-destructive'
          }`}
        />
      </span>
      <span>
        {t('live')} • {t('updatedAgo', { seconds: secondsAgo })}
      </span>
      {secondsAgo > 30 && onRefresh && (
        <button
          onClick={onRefresh}
          className="text-primary hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          {t('refreshNow')}
        </button>
      )}
    </div>
  );
}
