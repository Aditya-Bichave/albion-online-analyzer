'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skull, Swords, X } from 'lucide-react';
import type { Event } from '@/lib/kill-feed-service';
import { useTranslations } from 'next-intl';

function formatFame(fame: number) {
  if (fame >= 1_000_000) return (fame / 1_000_000).toFixed(2) + 'm';
  if (fame >= 1_000) return (fame / 1_000).toFixed(1) + 'k';
  return fame.toLocaleString();
}

function formatTimeAgo(timestamp: string, t: any) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t('justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('minutesAgo', { n: minutes });
  const hours = Math.floor(minutes / 60);
  return t('hoursAgo', { n: hours });
}

export function LiveKillToasts() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to avoid SSR issues with translations
  if (!isMounted) return null;

  return <LiveKillToastsContent />;
}

function LiveKillToastsContent() {
  const t = useTranslations('LiveKillToasts');
  const pathname = usePathname();
  const [queue, setQueue] = useState<Event[]>([]);
  const [current, setCurrent] = useState<Event | null>(null);
  const [muted, setMuted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Hide on kill-feed page since we're already viewing the feed
  const shouldHide = pathname === '/tools/kill-feed';

  useEffect(() => {
    isMountedRef.current = true;
    setIsComponentReady(true);

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('ak_kill_toasts_muted_v3') : null;
    if (stored === 'true') {
      setMuted(true);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ak_kill_toasts_muted_v3', muted ? 'true' : 'false');
    if (muted && current) {
      setCurrent(null);
      setIsFadingOut(false);
    }
  }, [muted, current]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchEvents = async () => {
      try {
        const response = await fetch(
          '/api/proxy/gameinfo/events?limit=10&offset=0',
          { cache: 'no-store' }
        );
        console.log('Fetch response status:', response.status);
        if (!response.ok) return;
        const events: Event[] = await response.json();
        console.log('Fetched events:', events?.length);
        if (!events || events.length === 0) return;
        const fresh = events.filter(e => !seenIdsRef.current.has(e.EventId));
        console.log('Fresh events:', fresh.length);
        if (fresh.length === 0) return;
        fresh.forEach(e => seenIdsRef.current.add(e.EventId));
        if (isMountedRef.current) {
          setQueue(prev => {
            const newQueue = [...prev, ...fresh.slice(0, 5)];
            console.log('New queue length:', newQueue.length);
            return newQueue;
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchEvents();
    interval = setInterval(fetchEvents, 5000); // Fetch every 5 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Show kills in a loop: 4 seconds display, then fade out, then next
  useEffect(() => {
    console.log('Display effect - queue:', queue.length, 'current:', current, 'muted:', muted);
    if (!isMountedRef.current || !isComponentReady) return;
    if (muted) return;
    if (queue.length === 0) return;
    if (current) return; // Already showing a kill

    // Show the first kill in queue
    const next = queue[0];
    console.log('Showing kill:', next.Killer.Name, '->', next.Victim.Name);
    setCurrent(next);
    setQueue(prev => prev.slice(1));
  }, [queue, current, muted, isComponentReady]);

  // Handle fade out timing
  useEffect(() => {
    if (!current || muted || !isComponentReady) return;

    // After 4 seconds, start fade out
    fadeTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsFadingOut(true);
      }
    }, 4000);

    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [current, muted, isComponentReady]);

  // Handle clearing after fade out
  useEffect(() => {
    if (!isFadingOut) return;

    hideTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setCurrent(null);
        setIsFadingOut(false);
      }
    }, 300);

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isFadingOut]);

  if (!current || muted || !isComponentReady || shouldHide) {
    console.log('Not rendering - current:', !!current, 'muted:', muted, 'isComponentReady:', isComponentReady, 'shouldHide:', shouldHide);
    return null;
  }

  console.log('Rendering kill toast:', current.Killer.Name, '->', current.Victim.Name);
  const killer = current.Killer;
  const victim = current.Victim;

  return (
    <div className="hidden md:block fixed bottom-5 left-5 right-auto md:left-4 md:right-auto z-40 transition-all duration-300 ${isFadingOut ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}">
      <Link href="/tools/kill-feed" className="block">
        <div className="relative max-w-md md:w-70 md:max-w-110 mx-auto md:mx-0 bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-red-500/60 transition-all shadow-lg">
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setMuted(true);
            }}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full h-6 w-6 flex items-center justify-center bg-background/60"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="uppercase tracking-wide font-semibold">{t('liveKill')}</span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(current.TimeStamp, t)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="text-xs text-muted-foreground">{t('killer')}</div>
                  <div className="font-bold text-sm text-emerald-400 truncate">{killer.Name}</div>
                  {killer.GuildName && (
                    <div className="text-[10px] text-muted-foreground truncate">{killer.GuildName}</div>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center mx-1">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/40">
                    <Swords className="h-4 w-4 text-red-400" />
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-0">
                  <div className="text-xs text-muted-foreground text-right">{t('victim')}</div>
                  <div className="font-bold text-sm text-red-400 truncate">{victim.Name}</div>
                  {victim.GuildName && (
                    <div className="text-[10px] text-muted-foreground truncate">{victim.GuildName}</div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Skull className="h-3 w-3 text-amber-500" />
                  <span className="font-mono text-amber-400 font-semibold">{formatFame(current.TotalVictimKillFame)} {t('fame')}</span>
                </div>
                {current.Location && (
                  <div className="truncate max-w-[60%] text-right">
                    {current.Location}
                  </div>
                )}
              </div>
              <div className="mt-2 text-[11px] text-primary flex items-center justify-between">
                <span className="underline">{t('openFeed')}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
