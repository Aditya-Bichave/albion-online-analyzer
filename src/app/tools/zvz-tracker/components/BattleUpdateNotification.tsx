'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  newBattleCount: number;
  onRefresh: () => void;
}

export default function BattleUpdateNotification({ newBattleCount, onRefresh }: Props) {
  const t = useTranslations('ZvzTracker');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newBattleCount > 0) {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [newBattleCount]);

  if (!visible || newBattleCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <div>
          <p className="font-bold">{t('newBattlesDetected', { count: newBattleCount })}</p>
          <p className="text-xs opacity-80">{t('refreshingAutomatically')}</p>
        </div>
      </div>
    </div>
  );
}
