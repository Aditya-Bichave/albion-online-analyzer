'use client';

import { BarChart3 } from 'lucide-react';

interface ChartEmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

export function ChartEmptyState({ 
  message, 
  subMessage,
  icon 
}: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground animate-in fade-in">
      {icon || <BarChart3 className="h-16 w-16 mb-4 opacity-20" />}
      <p className="text-sm font-semibold text-foreground mb-1">{message}</p>
      {subMessage && (
        <p className="text-xs text-muted-foreground">{subMessage}</p>
      )}
    </div>
  );
}

export function ChartLoadingState({ height = 400 }: { height?: number }) {
  return (
    <div 
      className="w-full bg-muted/20 animate-pulse rounded-xl"
      style={{ height: `${height}px` }}
    />
  );
}

export function BattleCardSkeleton() {
  return (
    <div className="p-4 bg-muted/20 rounded-xl border border-border animate-pulse">
      <div className="h-4 w-32 bg-muted/40 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted/30 rounded" />
        <div className="h-3 w-2/3 bg-muted/30 rounded" />
      </div>
    </div>
  );
}
