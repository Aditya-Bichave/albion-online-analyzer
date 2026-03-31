'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRecentEvents } from '../actions';
import { Event } from '../types';

interface UseKillFeedOptions {
  server: string;
  autoRefresh?: boolean;
  itemsPerPage?: number;
}

export function useKillFeed({ 
  server, 
  autoRefresh = true, 
  itemsPerPage = 20 
}: UseKillFeedOptions) {
  const [events, setEvents] = useState<Event[]>([]);
  const [graphEvents, setGraphEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      if (events.length === 0 && page === 1) setLoading(true);

      const isLive = page === 1;
      const fetchLimit = isLive ? 50 : itemsPerPage;
      const offset = (page - 1) * itemsPerPage;

      const { events: newEvents, error } = await fetchRecentEvents(server as any, fetchLimit, offset);
      
      if (error) {
        console.error(error);
      } else {
        if (isLive) {
          setGraphEvents(prev => {
            const existingIds = new Set(prev.map(e => e.EventId));
            const uniqueNew = newEvents.filter(e => !existingIds.has(e.EventId));
            return [...prev, ...uniqueNew]
              .sort((a, b) => new Date(a.TimeStamp).getTime() - new Date(b.TimeStamp).getTime())
              .slice(-5000);
          });
          setEvents(newEvents.slice(0, itemsPerPage));
        } else {
          setEvents(newEvents);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [server, events.length, page, itemsPerPage]);

  useEffect(() => {
    loadFeed();
  }, [server, loadFeed, page]);

  useEffect(() => {
    if (autoRefresh && page === 1) {
      refreshIntervalRef.current = setInterval(loadFeed, 30000);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, page, loadFeed]);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setEvents([]);
    loadFeed();
  }, [loadFeed]);

  return {
    events,
    graphEvents,
    loading,
    page,
    loadFeed,
    handleNextPage,
    handlePrevPage,
    handleRefresh,
    setPage
  };
}
