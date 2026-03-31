'use client';

import { useEffect, useState } from 'react';
import {
  Coins,
  Crown,
  BarChart3,
  Swords,
  Users,
  Sword,
  TrendingUp,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { TickerData } from "@/lib/ticker-service";
import { useTranslations } from 'next-intl';

interface MarketTickerProps {
  data?: TickerData;
}

export function MarketTicker({ data }: MarketTickerProps) {
  const t = useTranslations('MarketTicker');
  const [tickerData, setTickerData] = useState<TickerData | null>(data || null);
  const [loading, setLoading] = useState(!data);

  // Fetch ticker data client-side if not provided
  useEffect(() => {
    if (!data) {
      const fetchTickerData = async () => {
        try {
          const response = await fetch('/api/ticker');
          if (response.ok) {
            const result = await response.json();
            setTickerData(result);
          }
        } catch (error) {
          console.error('Failed to fetch ticker data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTickerData();
    }
  }, [data]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const renderTrend = (trend: number) => {
    const isPositive = trend >= 0;
    const colorClass = isPositive ? "text-success" : "text-destructive";
    const rotationClass = isPositive ? "" : "rotate-180";

    return (
      <span className={`${colorClass} text-xs flex items-center gap-0.5`}>
        <TrendingUp className={`h-3 w-3 ${rotationClass}`} />
        {Math.abs(trend).toFixed(1)}%
      </span>
    );
  };

  // Show empty state while loading (keeps original layout)
  if (loading || !tickerData) {
    return (
      <div className="relative md:absolute bottom-0 left-0 right-0 z-20 bg-card/80 border-t border-border/10 backdrop-blur-md overflow-hidden py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative md:absolute bottom-0 left-0 right-0 z-20 bg-card/80 border-t border-border/10 backdrop-blur-md overflow-hidden py-4">
      {/* Mobile Grid View */}
      <div className="grid grid-cols-2 gap-4 px-4 md:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="h-3 w-3 text-warning" /> {t('goldPrice')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {formatNumber(tickerData.goldPrice)}
            </span>
            {renderTrend(tickerData.goldTrend)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Crown className="h-3 w-3 text-primary" /> {t('premium')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {formatLargeNumber(tickerData.premiumPrice)}
            </span>
            {renderTrend(tickerData.premiumTrend)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3 text-info" /> {t('blackMarket')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {tickerData.blackMarketVolume}
            </span>
            {renderTrend(tickerData.blackMarketTrend)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Swords className="h-3 w-3 text-destructive" /> {t('activeBattles')}
          </div>
          <div className="text-sm font-bold text-foreground">
            {tickerData.activeBattles}
          </div>
        </div>
      </div>

      {/* Desktop Row View */}
      <div className="hidden md:flex items-center justify-between max-w-6xl mx-auto px-6 gap-8">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Coins className="h-3 w-3 text-warning" /> {t('goldPrice')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {formatNumber(tickerData.goldPrice)}
              </span>
              {renderTrend(tickerData.goldTrend)}
            </div>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="h-3 w-3 text-primary" /> {t('premium')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {formatLargeNumber(tickerData.premiumPrice)}
              </span>
              {renderTrend(tickerData.premiumTrend)}
            </div>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3 text-info" /> {t('blackMarket')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {tickerData.blackMarketVolume}
              </span>
              {renderTrend(tickerData.blackMarketTrend)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Swords className="h-3 w-3 text-destructive" /> {t('activeBattles')}
            </div>
            <span className="text-sm font-bold text-foreground">
              {tickerData.activeBattles}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-success" /> {t('topGuild')}
            </div>
            <span className="text-sm font-bold text-foreground truncate max-w-[150px]">
              {tickerData.topGuild}
            </span>
          </div>

          {tickerData.hotFlips && tickerData.hotFlips.length > 0 && (
            <>
              <div className="h-8 w-px bg-border/50" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-3 w-3 text-amber-500" /> Hot Flips
              </div>
              <div className="flex items-center gap-3">
                {tickerData.hotFlips.slice(0, 3).map((flip, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                      {flip.name}
                    </span>
                    <span className="text-xs text-success flex items-center gap-0.5">
                      +{formatNumber(flip.profit)}
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
