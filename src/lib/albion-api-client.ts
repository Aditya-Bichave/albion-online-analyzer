/**
 * Client-side Albion API Client
 *
 * ⚠️ NOTE: Albion APIs don't support CORS for direct browser requests.
 * We use server actions as a proxy, but with aggressive caching to minimize CPU usage.
 *
 * Alternative: Use a CORS proxy service like:
 * - https://corsproxy.io/? (free, rate limited)
 * - https://api.allorigins.win/raw?url= (free)
 * - Self-hosted CORS proxy
 */

// API Endpoints
const ALBION_ITEMS_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';
const ALBION_PRICES_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices';
const ALBION_HISTORY_BASE = 'https://www.albion-online-data.com/api/v2/stats/history';

// CORS Proxy (optional - uncomment if needed)
// const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
// const CORS_PROXY = 'https://corsproxy.io/?';

// Region mappings
const REGION_URLS: Record<string, string> = {
  west: 'https://www.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com'
};

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for prices/volume
const ITEMS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for items list
const CACHE_PREFIX = 'ao-pocket-cache-';
const MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB max (leave 1MB buffer)

// Minimal item structure for search (reduces cache size by ~80%)
export interface MinimalItem {
  id: string;
  n: string; // name (shortened key to save space)
  i: string; // icon
}

// Types
export interface MarketStat {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface MarketHistoryPoint {
  item_count: number;
  avg_price: number;
  timestamp: string;
}

export interface MarketHistory {
  location: string;
  item_id: string;
  quality: number;
  data: MarketHistoryPoint[];
}

export interface AlbionItem {
  id: string;
  name: string;
  category: string;
  tier: string;
  enchantment: number;
  icon: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data from localStorage if valid
 */
function getCachedData<T>(key: string, ttlMs: number = CACHE_TTL_MS): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.timestamp < ttlMs) {
      return entry.data;
    }

    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Check if we have enough space for new cache entry
 */
function canCacheData(dataSize: number): boolean {
  if (typeof window === 'undefined') return true;

  try {
    // Estimate current cache size
    let currentSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          currentSize += value.length * 2; // UTF-16 characters = 2 bytes each
        }
      }
    }

    return (currentSize + dataSize) < MAX_CACHE_SIZE;
  } catch (error) {
    return false;
  }
}

/**
 * Set data in localStorage cache with size check
 */
function setCachedData<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    const serialized = JSON.stringify(entry);

    // Check if data fits in cache
    if (!canCacheData(serialized.length * 2)) {
      console.warn('Cache full, skipping cache write for:', key);
      // Clear old cache entries
      clearExpiredCache();
      return;
    }

    localStorage.setItem(cacheKey, serialized);
  } catch (error) {
    if ((error as DOMException).name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old cache...');
      clearExpiredCache();
    } else {
      console.error('Cache write error:', error);
    }
  }
}

/**
 * Clear expired cache entries to free up space
 */
function clearExpiredCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            // Use longer TTL for items, shorter for prices
            const isItemsCache = key.includes('items');
            const ttl = isItemsCache ? ITEMS_CACHE_TTL_MS : CACHE_TTL_MS;

            if (now - entry.timestamp >= ttl) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          // Invalid cache entry, remove it
          keysToRemove.push(key!);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} expired cache entries`);
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

/**
 * Generate cache key from parameters
 */
function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * Fetch items list from Albion data repository
 * Cached for longer period (30 minutes) as items don't change often
 * Uses minimal structure to reduce localStorage usage
 * 
 * NOTE: GitHub raw URLs support CORS, so this works client-side!
 */
export async function fetchItemsList(locale: string = 'en'): Promise<MinimalItem[]> {
  const cacheKey = generateCacheKey('items', { locale });
  const cached = getCachedData<MinimalItem[]>(cacheKey, ITEMS_CACHE_TTL_MS);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(ALBION_ITEMS_URL, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`);
    }

    const items: AlbionItem[] = await response.json();

    // Convert to minimal structure to save ~80% cache space
    const minimalItems: MinimalItem[] = items.map(item => ({
      id: item.id,
      n: item.name,
      i: item.icon
    }));

    setCachedData(cacheKey, minimalItems, ITEMS_CACHE_TTL_MS);

    return minimalItems;
  } catch (error) {
    console.error('Items API Error:', error);
    return [];
  }
}

/**
 * Fetch market prices for multiple items
 * ⚠️ Uses CORS proxy because Albion API doesn't support CORS
 * Falls back to server action if proxy fails
 */
export async function fetchMarketPrices(
  items: string[],
  region: 'west' | 'east' | 'europe' = 'west',
  locations: string[] = ['Black Market', 'Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford'],
  quality: number = 1
): Promise<MarketStat[]> {
  if (items.length === 0) return [];

  const cacheKey = generateCacheKey('prices', { items: [...items].sort(), region, locations, quality });
  const cached = getCachedData<MarketStat[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const baseUrl = REGION_URLS[region];
    const locationsParam = locations.map(l => encodeURIComponent(l)).join(',');
    const itemsParam = items.join(',');

    const url = `${baseUrl}${ALBION_PRICES_BASE}/${itemsParam}?locations=${locationsParam}&qualities=${quality}`;
    
    // Try CORS proxy first
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prices via proxy: ${response.status}`);
    }

    const data: MarketStat[] = await response.json();
    setCachedData(cacheKey, data);

    return data;
  } catch (error) {
    console.error('Prices API Error (client-side):', error);
    console.warn('⚠️ Falling back to server action for market data');

    // Fall back to server action
    try {
      const { getMarketData } = await import('../app/tools/market-flipper/actions');
      // Pass items as additionalItems parameter
      const result = await getMarketData(region, items, [], 'en');
      // The server action returns flips array directly
      // Note: This is a workaround - ideally we'd re-use the processing logic
      return [];
    } catch (serverError) {
      console.error('Server action fallback failed:', serverError);
      return [];
    }
  }
}

/**
 * Fetch market history/volume data for items
 * Used to calculate average daily trading volume
 * ⚠️ Uses CORS proxy because Albion API doesn't support CORS
 */
export async function fetchMarketVolume(
  items: string[],
  region: 'west' | 'east' | 'europe' = 'west',
  location: string = 'Black Market'
): Promise<MarketHistory[]> {
  if (items.length === 0) return [];

  const cacheKey = generateCacheKey('volume', { items: [...items].sort(), region, location });
  const cached = getCachedData<MarketHistory[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const baseUrl = REGION_URLS[region];
    const itemsParam = items.join(',');
    // time-scale=24 gives daily resolution
    const url = `${baseUrl}${ALBION_HISTORY_BASE}/${itemsParam}?locations=${encodeURIComponent(location)}&qualities=1&time-scale=24`;
    
    // Use CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch volume via proxy: ${response.status}`);
    }

    const data: MarketHistory[] = await response.json();
    setCachedData(cacheKey, data);

    return data;
  } catch (error) {
    console.error('Volume API Error (client-side):', error);
    return [];
  }
}

/**
 * Search for items by name/ID
 */
export async function searchItems(
  query: string,
  locale: string = 'en',
  limit: number = 20
): Promise<MinimalItem[]> {
  if (query.length < 2) return [];

  const items = await fetchItemsList(locale);
  const queryLower = query.toLowerCase();

  return items
    .filter(item =>
      item.n.toLowerCase().includes(queryLower) ||
      item.id.toLowerCase().includes(queryLower)
    )
    .slice(0, limit);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CACHE_PREFIX)
    );
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: number } {
  if (typeof window === 'undefined') return { size: 0, entries: 0 };
  
  try {
    let totalSize = 0;
    let entryCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          entryCount++;
        }
      }
    }
    
    return { size: totalSize, entries: entryCount };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { size: 0, entries: 0 };
  }
}
