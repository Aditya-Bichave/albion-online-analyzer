'use client';

import { Filter, Clock, Users, MapPin, Search, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { ZvZFilters as Filters } from '../types';

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
}

export function FiltersSection({ filters, onFiltersChange, onReset }: Props) {
  const t = useTranslations('ZvzTracker');

  return (
    <div className="bg-card/50 p-6 rounded-2xl border border-border/50 mb-6 animate-fade-in-up delay-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Filter className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t('filtersTitle')}</h3>
            <p className="text-xs text-muted-foreground">{t('filtersDescription')}</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          {t('resetFilters')}
        </button>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {t('timeRangeLabel')}
          </label>
          <Select
            options={[
              { value: '24h', label: t('timeRange24h') },
              { value: '7d', label: t('timeRange7d') },
              { value: '30d', label: t('timeRange30d') },
              { value: 'all', label: t('timeRangeAll') },
            ]}
            value={filters.timeRange}
            onChange={(value) => onFiltersChange({ timeRange: value as Filters['timeRange'] })}
          />
        </div>

        {/* Zone Type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {t('zoneTypeLabel')}
          </label>
          <Select
            options={[
              { value: 'all', label: t('zoneTypeAll') },
              { value: 'crystal_tower', label: t('zoneTypeCrystalTower') },
              { value: 'territory', label: t('zoneTypeTerritory') },
              { value: 'open_world', label: t('zoneTypeOpenWorld') },
            ]}
            value={filters.zoneType || 'all'}
            onChange={(value) => onFiltersChange({ zoneType: value as Filters['zoneType'] })}
          />
        </div>

        {/* Battle Status */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {t('battleStatusLabel')}
          </label>
          <Select
            options={[
              { value: 'all', label: t('battleStatusAll') },
              { value: 'live', label: t('battleStatusLive') },
              { value: 'ended', label: t('battleStatusEnded') },
            ]}
            value={filters.battleStatus}
            onChange={(value) => onFiltersChange({ battleStatus: value as Filters['battleStatus'] })}
          />
        </div>

        {/* Min Participants */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {t('minParticipantsLabel')}
          </label>
          <Select
            options={[
              { value: '0', label: t('minParticipantsAny') },
              { value: '10', label: t('minParticipants10') },
              { value: '20', label: t('minParticipants20') },
              { value: '50', label: t('minParticipants50') },
              { value: '100', label: t('minParticipants100') },
            ]}
            value={String(filters.minParticipants || 0)}
            onChange={(value) => onFiltersChange({ minParticipants: Number(value) })}
          />
        </div>
      </div>

      {/* Search Query */}
      <div className="pt-4 border-t border-border/50">
        <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <Search className="h-4 w-4" /> {t('searchGuildPlayerLabel')}
        </label>
        <Input
          type="text"
          value={filters.searchQuery || ''}
          onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          placeholder={t('searchGuildPlayerPlaceholder')}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
