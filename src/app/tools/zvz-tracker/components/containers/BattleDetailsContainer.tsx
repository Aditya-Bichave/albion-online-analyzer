'use client';

import { useBattleExpansion } from '../../hooks/useBattleExpansion';
import BattleDetails from '../BattleDetails';

interface Props {
  region: 'west' | 'east' | 'europe';
  t: (key: string) => string;
  tKill: (key: string) => string;
}

/**
 * Container component for BattleDetails
 * Handles data fetching and state management for battle expansion
 */
export default function BattleDetailsContainer({ region, t, tKill }: Props) {
  const {
    expandedBattleId,
    battleDetails,
    battleEvents,
    detailsLoading,
    activeTab,
    feedPage,
    expandBattle,
    closeBattle,
    setDetailTab,
    setFeedPage
  } = useBattleExpansion(region);

  // If no battle is expanded, render nothing
  if (!expandedBattleId || !battleDetails) {
    return null;
  }

  return (
    <>
      <div id={`battle-${expandedBattleId}`} className="animate-slide-in-from-bottom">
        <BattleDetails
          battle={battleDetails}
          events={battleEvents}
          activeTab={activeTab}
          onTabChange={(tab: string) => setDetailTab(tab as any)}
          feedPage={feedPage}
          onFeedPageChange={setFeedPage}
          t={t}
          tKill={tKill}
          loading={detailsLoading}
          onClose={closeBattle}
        />
      </div>
    </>
  );
}

/**
 * Hook to get the container's state from parent
 */
export function useBattleDetailsContainer() {
  return {
    Component: BattleDetailsContainer
  };
}
