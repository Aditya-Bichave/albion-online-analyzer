'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/PageShell';
import { WEAPONS_DATABASE, WEAPON_CATEGORIES, META_RATINGS, CONTENT_TYPES, Weapon } from '@/data/weapons-database';
import { Search, Filter, Sword, Crosshair, Zap, Shield, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 9;

export default function WeaponsListClient() {
  const t = useTranslations('WeaponsList');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMeta, setSelectedMeta] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredWeapons = useMemo(() => {
    return WEAPONS_DATABASE.filter(weapon => {
      const matchesSearch = weapon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        weapon.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || weapon.category === selectedCategory;
      const matchesMeta = selectedMeta === 'all' || weapon.metaRating === selectedMeta;
      return matchesSearch && matchesCategory && matchesMeta;
    });
  }, [searchQuery, selectedCategory, selectedMeta]);

  const totalPages = Math.ceil(filteredWeapons.length / ITEMS_PER_PAGE);
  const paginatedWeapons = filteredWeapons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'melee': return <Sword className="h-4 w-4" />;
      case 'ranged': return <Crosshair className="h-4 w-4" />;
      case 'staff': return <Zap className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getMetaColor = (rating: string) => {
    switch (rating) {
      case 'S': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'A': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'B': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'C': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'hard': return 'text-destructive bg-destructive/10';
      default: return 'text-gray-500';
    }
  };

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('heroTitle')}</h1>
          <p className="text-muted-foreground">{t('heroSubtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              <Filter className="h-4 w-4 mr-1" />
              {t('all')}
            </Button>
            {Object.entries(WEAPON_CATEGORIES).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {getCategoryIcon(key)}
                <span className="ml-1">{t(key)}</span>
              </Button>
            ))}
          </div>

          {/* Meta Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMeta === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMeta('all')}
            >
              <Star className="h-4 w-4 mr-1" />
              {t('allMeta')}
            </Button>
            {Object.entries(META_RATINGS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedMeta === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMeta(key)}
              >
                {key}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {t('results', { count: filteredWeapons.length, total: WEAPONS_DATABASE.length })}
          </div>
        </div>

        {/* Weapons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedWeapons.map((weapon) => (
            <Link
              key={weapon.id}
              href={`/guides/combat/weapons/${weapon.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(weapon.category)}
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {weapon.name}
                    </h3>
                  </div>
                  <Badge className={getMetaColor(weapon.metaRating)}>
                    {weapon.metaRating}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{weapon.type}</p>
              </div>

              {/* Stats */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getDifficultyColor(weapon.difficulty)}>
                    {t(weapon.difficulty)}
                  </Badge>
                  {weapon.role.slice(0, 2).map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>

                {/* Stat Bars */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">{t('burstDamage')}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-destructive h-2 rounded-full transition-all"
                        style={{ width: `${weapon.stats.burstDamage}%` }}
                      />
                    </div>
                    <span className="text-foreground w-8 text-right">{weapon.stats.burstDamage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">{t('sustainedDamage')}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full transition-all"
                        style={{ width: `${weapon.stats.sustainedDamage}%` }}
                      />
                    </div>
                    <span className="text-foreground w-8 text-right">{weapon.stats.sustainedDamage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">{t('mobility')}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-info h-2 rounded-full transition-all"
                        style={{ width: `${weapon.stats.mobility}%` }}
                      />
                    </div>
                    <span className="text-foreground w-8 text-right">{weapon.stats.mobility}</span>
                  </div>
                </div>

                {/* Best For */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t('bestFor')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {weapon.bestFor.slice(0, 3).map((use, index) => (
                      <span key={index} className="text-[10px] text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('viewGuide')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Empty State */}
        {filteredWeapons.length === 0 && (
          <div className="bg-card/50 rounded-2xl border border-border p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">{t('noResults')}</h3>
            <p className="text-muted-foreground">{t('noResultsDesc')}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
