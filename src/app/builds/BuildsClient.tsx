'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageShell } from '@/components/PageShell';
import { InfoStrip, InfoBanner } from '@/components/InfoStrip';
import { BuildCard } from '@/components/BuildCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Build, getPaginatedBuilds } from '@/lib/builds-service';
import { Search, Filter, X, Swords, Sparkles, Shield, Users } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCachedBuilds, cacheBuilds, isCacheValid } from '@/lib/build-cache';

const PAGE_SIZE = 24;

// Filter option constants - based on actual build tags
const FILTER_OPTIONS = {
  // Zone type tags
  zoneTags: [
    'black_zone', 'blue_zone', 'red_zone', 'yellow_zone',
    'open_world', 'mists', 'roads_avalon', 'hellgate', 'arena',
    'ava-dungeon', 'corrupted-dungeon', 'crystal_league', 'depths',
    'knightfall_abbey', 'solo-dungeon', 'static-dungeon', 'territory'
  ] as const,

  // Activity tags
  activityTags: [
    'fame_silver_farm', 'gathering', 'crafting', 'ganking',
    'pvp', 'ratting', 'tracking', 'transporting', 'exploration',
    'faction_warfare'
  ] as const
};

export default function BuildsClient() {
  const t = useTranslations('Builds');
  const router = useRouter();
  const pathname = usePathname();

  // Filter states
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Fetch builds with pagination
  const fetchBuilds = useCallback(async (page: number = 1) => {
    console.log('🔄 Fetching builds for page:', page);
    setLoading(true);

    try {
      const result = await getPaginatedBuilds(
        {
          zoneTags: selectedZone !== 'all' ? [selectedZone] : undefined,
          activityTags: selectedActivity !== 'all' ? [selectedActivity] : undefined,
          search: search || undefined,
          limit: PAGE_SIZE,
          page
        }
      );

      console.log('✅ Received builds:', result.builds.length, 'Total:', result.total, 'Page:', page);
      console.log('First build ID:', result.builds[0]?.id, 'Last build ID:', result.builds[result.builds.length - 1]?.id);
      
      setBuilds(result.builds);
      setTotal(result.total || 0);
      const newTotalPages = result.total ? Math.ceil(result.total / PAGE_SIZE) : 1;
      setTotalPages(newTotalPages);
      setCurrentPage(page);

      // Cache results for page 1
      if (page === 1) {
        cacheBuilds(result.builds);
      }
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedActivity, search, PAGE_SIZE]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedZone !== 'all') params.set('zone', selectedZone);
    if (selectedActivity !== 'all') params.set('activity', selectedActivity);
    if (search) params.set('search', search);
    if (currentPage > 1) params.set('page', String(currentPage));

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [selectedZone, selectedActivity, search, currentPage, pathname, router]);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlZone = params.get('zone') || 'all';
    const urlActivity = params.get('activity') || 'all';
    const urlSearch = params.get('search') || '';
    const urlPage = parseInt(params.get('page') || '1');

    setSelectedZone(urlZone);
    setSelectedActivity(urlActivity);
    setSearch(urlSearch);
    
    // Try cache first for initial load
    const cached = getCachedBuilds('all');
    if (cached.length > 0 && isCacheValid()) {
      setBuilds(cached);
      setLoading(false);
      // Fetch fresh data in background
      fetchBuilds(urlPage);
    } else {
      fetchBuilds(urlPage);
    }
  }, []);

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    fetchBuilds(1);
  }, [selectedZone, selectedActivity, search, fetchBuilds]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedZone('all');
    setSelectedActivity('all');
    setSearch('');
    setCurrentPage(1);
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() =>
    [selectedZone, selectedActivity].filter(f => f !== 'all').length + (search ? 1 : 0)
  , [selectedZone, selectedActivity, search]);

  return (
    <PageShell
      title={t('title')}
      backgroundImage="/background/ao-builds.jpg"
      description={t('description')}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Results count and clear filters */}
        {!loading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {total > 0
                ? t('showingResults', { count: builds.length, total })
                : t('noBuilds')
              }
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {t('clearFilters')} ({activeFiltersCount})
              </Button>
            )}
          </div>
        )}

        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant={showFilters || activeFiltersCount > 0 ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 h-11"
          >
            <Filter className="h-4 w-4" />
            {t('filters')}
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary-foreground text-primary text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card/50 rounded-xl border border-border p-6 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="space-y-6">
              {/* Zone Filters */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Zone
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedZone('all'); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedZone === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All Zones
                  </button>
                  {FILTER_OPTIONS.zoneTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSelectedZone(tag); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedZone === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t(`tagOptions.${tag}`) || tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Filters */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Activity
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedActivity('all'); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedActivity === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All Activities
                  </button>
                  {FILTER_OPTIONS.activityTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSelectedActivity(tag); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedActivity === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t(`tagOptions.${tag}`) || tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Builds Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card/50 border border-border rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-16 h-16 bg-muted/50 rounded-lg border border-border/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-3/4" />
                    <div className="h-3 bg-muted/50 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-muted/50 rounded border border-border" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-5 bg-muted/50 rounded border border-border w-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-border border-dashed">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">{t('noBuildsFound')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('noBuildsFoundDesc')}</p>
            <Button variant="outline" onClick={clearAllFilters}>
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {builds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    fetchBuilds(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isLoading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>

      <InfoStrip currentPage="builds">
        <InfoBanner icon={<Swords className="w-4 h-4" />} color="text-amber-400" title={t('title')}>
          <p>{t('infoTitle')}</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-xs opacity-90">
            <li>{t('infoPoint1')}</li>
            <li>{t('infoPoint2')}</li>
            <li>{t('infoPoint3')}</li>
          </ul>
        </InfoBanner>
      </InfoStrip>
    </PageShell>
  );
}
