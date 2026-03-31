'use client';

import { Battle } from '../../types';
import BattleCard from '../BattleCard';

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
 * Container component for BattleList
 * Handles data logic and passes to presentational component
 */
export default function BattleListContainer({
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
    <div className="space-y-4">
      {/* Live Battles */}
      {hasLiveBattles && (
        <section>
          <h2 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            {t('liveBattles')}
          </h2>
          <div className="space-y-4">
            {liveBattles.map(battle => (
              <div key={battle.id}>
                <BattleCard
                  battle={battle}
                  isExpanded={expandedBattleId === battle.id}
                  onExpand={() => onExpandBattle(battle.id)}
                  isLive={true}
                  onCopyLink={() => onCopyLink(battle.id)}
                  formatTimeAgo={formatTimeAgo}
                  t={t}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Battles */}
      {hasPastBattles && (
        <section>
          <h2 className="text-lg font-medium text-muted-foreground mb-4">
            {t('recentHistory')}
          </h2>
          <div className="space-y-4">
            {battles.map(battle => (
              <div key={battle.id}>
                <BattleCard
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
        <div key={i} className="bg-card/80 border border-border/30 rounded-xl overflow-hidden animate-pulse h-32" />
      ))}
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{t('noBattlesFound')}</p>
    </div>
  );
}
