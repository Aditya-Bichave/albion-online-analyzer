import { cache } from 'react';
import { getGoldHistory } from './gold-service';
import { getItems, getItemNameService } from './item-service';
import { getMarketVolume, GAMEINFO_API, getMarketPrices } from './market-service';
import { POPULAR_ITEMS } from '@/app/tools/market-flipper/constants';
import { notifyUser } from './notification-service';
import { adminDb } from './firebase-admin';

export interface TickerData {
  goldPrice: number;
  goldTrend: number;
  premiumPrice: number;
  premiumTrend: number;
  blackMarketVolume: string;
  blackMarketTrend: number;
  topGuild: string;
  activeBattles: number;
  metaItem: string;
  mostTradedItem: string;
  hotFlips?: {
    name: string;
    profit: number;
    margin: number;
  }[];
}

export interface GlobalStats {
  itemsTracked: number;
  battlesAnalyzed: number;
  marketUpdates: string;
  uptime: string;
}

/**
 * Get global stats - lightweight, only fetches item count
 */
export const getGlobalStats = cache(async (locale: string = 'en'): Promise<GlobalStats> => {
  const items = await getItems(locale);

  return {
    itemsTracked: items.length,
    battlesAnalyzed: 50, // Static fallback - not critical
    marketUpdates: "24/7",
    uptime: "99.9%"
  };
});

/**
 * Get lightweight ticker data for homepage
 * Uses aggressive caching and reduced data fetching
 */
export const getTickerData = cache(async (locale: string = 'en'): Promise<TickerData> => {
  // 1. Fetch Gold Price (fast, cached)
  const goldHistory = await getGoldHistory('west', 2);

  let goldPrice = 0;
  let goldTrend = 0;

  if (goldHistory && goldHistory.length > 0) {
    const latest = goldHistory[goldHistory.length - 1];
    const previous = goldHistory.length > 1 ? goldHistory[goldHistory.length - 2] : latest;

    goldPrice = latest.price;
    if (previous.price > 0) {
      goldTrend = ((latest.price - previous.price) / previous.price) * 100;
    }
  }

  // 2. Calculate Premium Price
  const premiumPrice = goldPrice * 3750;
  const premiumTrend = goldTrend;

  // 3. Simplified Black Market Volume (fewer items)
  let blackMarketVolumeValue = 0;
  let blackMarketTrend = 0;

  try {
    const volumeItems = ['T4_BAG', 'T4_CAPE', 'T4_MAIN_SWORD'];
    const volumeData = await getMarketVolume(volumeItems, 'west', 'Black Market');

    if (Array.isArray(volumeData) && volumeData.length > 0) {
      let latestVolumeTotal = 0;
      let previousVolumeTotal = 0;

      volumeData.forEach(hist => {
        if (!hist.data || hist.data.length === 0) return;
        const lastIdx = hist.data.length - 1;
        const prevIdx = hist.data.length - 2;

        const latestPoint = hist.data[lastIdx];
        latestVolumeTotal += latestPoint.item_count * latestPoint.avg_price;

        if (prevIdx >= 0) {
          const prevPoint = hist.data[prevIdx];
          previousVolumeTotal += prevPoint.item_count * prevPoint.avg_price;
        }
      });

      blackMarketVolumeValue = latestVolumeTotal;
      if (previousVolumeTotal > 0) {
        blackMarketTrend = ((latestVolumeTotal - previousVolumeTotal) / previousVolumeTotal) * 100;
      }
    }
  } catch (e) {
    console.error('Failed to compute Black Market volume', e);
  }

  // 4. Format volume
  const formatVolume = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
    if (num <= 0) return '---';
    return num.toFixed(0);
  };

  // Return simplified data - guild, meta item, and hot flips removed for speed
  // These can be fetched client-side if needed
  return {
    goldPrice,
    goldTrend,
    premiumPrice,
    premiumTrend,
    blackMarketVolume: formatVolume(blackMarketVolumeValue),
    blackMarketTrend,
    topGuild: '—', // Static fallback
    activeBattles: 50, // Static fallback
    metaItem: '—', // Static fallback
    mostTradedItem: '—', // Static fallback
    hotFlips: [] // Empty - not critical for homepage
  };
});
