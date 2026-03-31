'use client';

import { Filter, X, PawPrint, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface AnimalFilters {
  minTier: number;
  maxTier: number;
  animalType: 'all' | 'pasture' | 'mount';
  profitability: 'all' | 'profitable' | 'break-even' | 'loss';
  searchQuery: string;
}

interface Props {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
  onReset: () => void;
  resultCount: number;
  t: (key: string) => string;
}

export default function AnimalFilters({ filters, onFiltersChange, onReset, resultCount, t }: Props) {
  const hasActiveFilters = 
    filters.minTier !== 3 || 
    filters.maxTier !== 8 || 
    filters.animalType !== 'all' || 
    filters.profitability !== 'all' ||
    filters.searchQuery !== '';

  const handleTierChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, minTier: min, maxTier: max });
  };

  return (
    <div className="bg-card/50 p-6 rounded-xl border border-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {t('filters.title')}
          </span>
          {resultCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {resultCount} {t('filters.results')}
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            {t('filters.reset')}
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('filters.tier')}
          </label>
          <div className="flex flex-wrap gap-1">
            {[3, 4, 5, 6, 7, 8].map((tier) => (
              <button
                key={tier}
                onClick={() => handleTierChange(tier, tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filters.minTier === tier && filters.maxTier === tier
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                T{tier}
              </button>
            ))}
            <button
              onClick={() => handleTierChange(3, 8)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filters.minTier === 3 && filters.maxTier === 8
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('filters.all')}
            </button>
          </div>
        </div>

        {/* Animal Type Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('filters.type')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onFiltersChange({ ...filters, animalType: 'all' })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filters.animalType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('filters.all')}
            </button>
            <Tooltip content={t('filters.pastureDesc')}>
              <button
                onClick={() => onFiltersChange({ ...filters, animalType: 'pasture' })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  filters.animalType === 'pasture'
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <PawPrint className="h-3 w-3" />
                {t('filters.pasture')}
              </button>
            </Tooltip>
            <Tooltip content={t('filters.mountDesc')}>
              <button
                onClick={() => onFiltersChange({ ...filters, animalType: 'mount' })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  filters.animalType === 'mount'
                    ? 'bg-blue-500/15 text-blue-500'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Mountain className="h-3 w-3" />
                {t('filters.mount')}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Profitability Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('filters.profitability')}
          </label>
          <div className="flex gap-1">
            <select
              value={filters.profitability}
              onChange={(e) => onFiltersChange({ ...filters, profitability: e.target.value as any })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t('filters.all')}</option>
              <option value="profitable">{t('filters.profitable')} (&gt;0%)</option>
              <option value="break-even">{t('filters.breakEven')} (20-50%)</option>
              <option value="excellent">{t('filters.excellent')} (&gt;50%)</option>
              <option value="loss">{t('filters.loss')} (&lt;0%)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('filters.search')}
          </label>
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {filters.minTier !== 3 || filters.maxTier !== 8 ? (
            <Badge variant="secondary" className="text-xs">
              {filters.minTier === filters.maxTier 
                ? `Tier ${filters.minTier}` 
                : `Tier ${filters.minTier}-${filters.maxTier}`}
              <button
                onClick={() => handleTierChange(3, 8)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          
          {filters.animalType !== 'all' && (
            <Badge variant="secondary" className="text-xs capitalize">
              {filters.animalType}
              <button
                onClick={() => onFiltersChange({ ...filters, animalType: 'all' })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.profitability !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {t(`filters.${filters.profitability}`)}
              <button
                onClick={() => onFiltersChange({ ...filters, profitability: 'all' })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="text-xs">
              "{filters.searchQuery}"
              <button
                onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
