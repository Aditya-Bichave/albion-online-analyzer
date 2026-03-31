'use client';

import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('Common');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Bouncing dots */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {/* Loading text */}
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{t('loading')}</p>
      </div>
    </div>
  );
}
