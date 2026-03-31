'use client';

import { Battle } from '../types';
import PremiumBattleCard from './PremiumBattleCard';
import '../styles/premium-animations.css';

interface Props {
  battles: Battle[]; // past battles only (paginated)
  liveBattles: Battle[]; // live battles (all)
  expandedBattleId: number | null;
  onExpandBattle: (battleId: number) => void;
  onCopyLink: (battleId: number) => void;
  isLive: (battle: Battle) => boolean;
  formatTimeAgo: (date: string) => string;
  t: (key: string) => string;
  loading?: boolean;
}

/**
 * Presentational component for BattleList
 * Pure UI component - no side effects or data fetching
 */
export default function BattleList({
  battles, // past battles (paginated)
  liveBattles, // all live battles
  expandedBattleId,
  onExpandBattle,
  onCopyLink,
  isLive,
  formatTimeAgo,
  t,
  loading = false
}: Props) {
  if (loading) return <BattleListSkeleton />;

  const hasLiveBattles = liveBattles.length > 0;
  const hasPastBattles = battles.length > 0;

  if (!hasLiveBattles && !hasPastBattles) {
    return <EmptyState t={t} />;
  }

  return (
    <div className="space-y-6">
      {/* Live Battles */}
      {hasLiveBattles && (
        <section className="animate-fade-in-up">
          <h2 className="text-lg font-black text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            {t('liveBattles')}
          </h2>
          <div className="space-y-4">
            {liveBattles.map((battle, idx) => (
              <div key={battle.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <PremiumBattleCard
                  battle={battle}
                  isExpanded={expandedBattleId === battle.id}
                  onExpand={() => onExpandBattle(battle.id)}
                  isLive={true}
                  onCopyLink={() => onCopyLink(battle.id)}
                  formatTimeAgo={formatTimeAgo}
                  t={t}
                  showLiveIndicator={true}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Battles */}
      {hasPastBattles && (
        <section className="animate-fade-in-up delay-200">
          <h2 className="text-lg font-black text-muted-foreground uppercase tracking-wider mb-4">
            {t('recentHistory')}
          </h2>
          <div className="space-y-4">
            {battles.map((battle, idx) => (
              <div key={battle.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <PremiumBattleCard
                  battle={battle}
                  isExpanded={expandedBattleId === battle.id}
                  onExpand={() => onExpandBattle(battle.id)}
                  isLive={false}
                  onCopyLink={() => onCopyLink(battle.id)}
                  formatTimeAgo={formatTimeAgo}
                  t={t}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BattleListSkeleton() {
  return (
    <div className="space-y-4 mb-8">
      {[1, 2, 3].map(i => (
        <div 
          key={i} 
          className="bg-card/80 border border-border/30 rounded-2xl overflow-hidden animate-pulse h-40"
        />
      ))}
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl border border-border/50">
      <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="font-bold text-lg">{t('noBattlesFound')}</p>
      <p className="text-sm mt-1">{t('adjustFiltersOrCheckBack')}</p>
    </div>
  );
}
