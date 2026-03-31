'use client';

import { AlertTriangle, Wifi, Database, RefreshCw, Swords } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Generic error boundary
export function ErrorBoundary({
  error,
  onRetry,
  t
}: {
  error: string;
  onRetry?: () => void;
  t?: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-lg font-bold text-foreground mb-2">{t ? t('somethingWentWrong') : "Something went wrong"}</h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t ? t('tryAgain') : "Try Again"}
        </Button>
      )}
    </div>
  );
}

// API error
export function ApiError({
  message,
  onRetry,
  t
}: {
  message: string;
  onRetry?: () => void;
  t?: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <Wifi className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-lg font-bold text-foreground mb-2">{t ? t('connectionError') : "Connection Error"}</h3>
      <p className="text-muted-foreground text-center mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t ? t('retryConnection') : "Retry Connection"}
        </Button>
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ 
  icon,
  title, 
  description,
  action 
}: { 
  icon?: React.ReactNode;
  title: string; 
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      {icon || <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />}
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// No battles found
export function NoBattlesFound({ t }: { t?: (key: string) => string }) {
  return (
    <EmptyState
      icon={<Swords className="h-16 w-16 text-muted-foreground/50" />}
      title={t ? t('noBattlesFound') : "No battles found"}
      description={t ? t('adjustFiltersOrCheckBack') : "Try adjusting your filters or check back later."}
    />
  );
}

// No search results
export function NoSearchResults({ t }: { t?: (key: string) => string }) {
  return (
    <EmptyState
      title={t ? t('noResultsFound') : "No results found"}
      description={t ? t('tryAdjustingFilters') : "Try adjusting your filters."}
    />
  );
}
