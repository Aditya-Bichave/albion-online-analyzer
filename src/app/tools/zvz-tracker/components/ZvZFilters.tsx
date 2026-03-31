'use client';

import { Filter, X } from 'lucide-react';
import { ZvZFilters as FiltersType } from '../types';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';

interface Props {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onReset: () => void;
  hasActiveFilters?: boolean;
  t: (key: string) => string;
}

export default function ZvZFilters({ filters, onFiltersChange, onReset, hasActiveFilters, t }: Props) {
  const active = hasActiveFilters ?? (
    filters.timeRange !== 'all' ||
    filters.battleStatus !== 'all' ||
    filters.minParticipants
  );

  return (
    <div className="mb-6 p-4 bg-card/50 border border-border rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold text-muted-foreground uppercase tracking-wider text-sm">
            {t('filters')}
          </span>
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            {t('reset')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Range */}
        <div>
          <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">
            {t('timeRange')}
          </label>
          <SegmentedControl
            options={[
              { value: '24h', label: '24h' },
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
              { value: 'all', label: t('all') }
            ]}
            value={filters.timeRange}
            onChange={(value) => onFiltersChange({ ...filters, timeRange: value as any })}
          />
        </div>

        {/* Battle Status */}
        <div>
          <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">
            {t('status')}
          </label>
          <SegmentedControl
            options={[
              { value: 'all', label: t('all') },
              { value: 'live', label: t('live') },
              { value: 'ended', label: t('ended') }
            ]}
            value={filters.battleStatus}
            onChange={(value) => onFiltersChange({ ...filters, battleStatus: value as any })}
          />
        </div>

        {/* Zone Type */}
        <div>
          <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">
            {t('zoneType')}
          </label>
          <SegmentedControl
            options={[
              { value: 'all', label: t('all') },
              { value: 'crystal_tower', label: t('crystalTower') },
              { value: 'territory', label: t('territory') },
              { value: 'open_world', label: t('openWorld') }
            ]}
            value={filters.zoneType || 'all'}
            onChange={(value) => onFiltersChange({ ...filters, zoneType: value as any })}
          />
        </div>

        {/* Min Participants */}
        <div>
          <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">
            {t('minParticipants')}
          </label>
          <SegmentedControl
            options={[
              { value: '0', label: t('any') },
              { value: '10', label: '10+' },
              { value: '20', label: '20+' },
              { value: '50', label: '50+' }
            ]}
            value={String(filters.minParticipants || 0)}
            onChange={(value) => onFiltersChange({ ...filters, minParticipants: Number(value) })}
          />
        </div>
      </div>
    </div>
  );
}
