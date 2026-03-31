'use client';

import { useTranslations } from 'next-intl';

export function StatsSection() {
  const t = useTranslations('HomePage');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 py-6 md:py-10 container mx-auto px-4 border-t border-border">
      <StatItem value="6,000+" label={t('itemsTracked')} />
      <StatItem value="50+" label={t('recentBattles')} />
      <StatItem value="24/7" label={t('marketUpdates')} />
      <StatItem value="99.9%" label={t('serverUptime')} />
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center space-y-2 group cursor-default">
      <p className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors">{value}</p>
      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
