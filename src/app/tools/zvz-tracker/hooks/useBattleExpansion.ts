'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBattleDetails, getBattleEvents } from '../actions';
import type { Battle, BattleEvent } from '../types';

interface UseBattleExpansionOptions {
  onSuccess?: (battle: Battle) => void;
  onError?: (error: string) => void;
  eventsPerPage?: number;
}

interface UseBattleExpansionReturn {
  expandedBattleId: number | null;
  battleDetails: Battle | null;
  battleEvents: BattleEvent[];
  detailsLoading: boolean;
  activeTab: 'analysis' | 'guilds' | 'alliances' | 'players' | 'feed';
  feedPage: number;
  expandBattle: (battleId: number) => Promise<void>;
  closeBattle: () => void;
  setDetailTab: (tab: 'analysis' | 'guilds' | 'alliances' | 'players' | 'feed') => void;
  setFeedPage: (page: number) => void;
  loadMoreEvents: () => Promise<void>;
}

const DEFAULT_EVENTS_PER_PAGE = 50;

/**
 * Custom hook for managing battle expansion and details loading
 */
export function useBattleExpansion(
  region: 'west' | 'east' | 'europe',
  options: UseBattleExpansionOptions = {}
): UseBattleExpansionReturn {
  const {
    onSuccess,
    onError,
    eventsPerPage = DEFAULT_EVENTS_PER_PAGE
  } = options;

  const [expandedBattleId, setExpandedBattleId] = useState<number | null>(null);
  const [battleDetails, setBattleDetails] = useState<Battle | null>(null);
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'guilds' | 'alliances' | 'players' | 'feed'>('analysis');
  const [feedPage, setFeedPage] = useState(1);

  /**
   * Expand battle and load details
   */
  const expandBattle = useCallback(async (battleId: number) => {
    if (expandedBattleId === battleId) {
      // Toggle off if already expanded
      setExpandedBattleId(null);
      setBattleDetails(null);
      setBattleEvents([]);
      return;
    }

    setExpandedBattleId(battleId);
    setBattleDetails(null);
    setBattleEvents([]);
    setFeedPage(1);
    setActiveTab('analysis');

    // Scroll to battle
    setTimeout(() => {
      const element = document.getElementById(`battle-${battleId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    setDetailsLoading(true);

    try {
      const [detailsRes, eventsRes] = await Promise.all([
        getBattleDetails(battleId.toString(), region),
        getBattleEvents(battleId.toString(), 0, eventsPerPage, region)
      ]);

      if (detailsRes.battle) {
        setBattleDetails(detailsRes.battle);
        onSuccess?.(detailsRes.battle);
      }
      
      if (eventsRes.events) {
        setBattleEvents(eventsRes.events);
      }
    } catch (err) {
      console.error('Failed to load battle details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load battle details';
      onError?.(errorMessage);
    } finally {
      setDetailsLoading(false);
    }
  }, [expandedBattleId, region, eventsPerPage, onSuccess, onError]);

  /**
   * Close expanded battle
   */
  const closeBattle = useCallback(() => {
    setExpandedBattleId(null);
    setBattleDetails(null);
    setBattleEvents([]);
    setActiveTab('analysis');
    setFeedPage(1);
  }, []);

  /**
   * Load more events when feed page changes
   */
  const loadMoreEvents = useCallback(async () => {
    if (!expandedBattleId) return;

    setDetailsLoading(true);
    const offset = (feedPage - 1) * eventsPerPage;
    
    try {
      const { events } = await getBattleEvents(expandedBattleId.toString(), offset, eventsPerPage, region);
      if (events) {
        setBattleEvents(events);
      }
    } catch (err) {
      console.error('Failed to load more events:', err);
      onError?.('Failed to load battle events');
    } finally {
      setDetailsLoading(false);
    }
  }, [expandedBattleId, feedPage, eventsPerPage, region, onError]);

  /**
   * Load events when entering feed tab
   */
  useEffect(() => {
    if (expandedBattleId && activeTab === 'feed') {
      loadMoreEvents();
    }
  }, [expandedBattleId, activeTab]);

  return {
    expandedBattleId,
    battleDetails,
    battleEvents,
    detailsLoading,
    activeTab,
    feedPage,
    expandBattle,
    closeBattle,
    setDetailTab: setActiveTab,
    setFeedPage,
    loadMoreEvents
  };
}
