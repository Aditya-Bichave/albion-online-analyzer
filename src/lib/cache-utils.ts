/**
 * Cache Management Utilities
 * Helper functions to manage localStorage cache
 */

const CACHE_PREFIX = 'ao-pocket-cache-';

/**
 * Clear all AlbionKit cache from localStorage
 * Call this if you encounter "QuotaExceededError"
 */
export function clearAlbionKitCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Cleared ${keysToRemove.length} cache entries from localStorage`);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get current cache size and entry count
 */
export function getCacheInfo(): { 
  sizeKB: number; 
  entries: number; 
  quotaUsedPercent: number 
} {
  if (typeof window === 'undefined') return { sizeKB: 0, entries: 0, quotaUsedPercent: 0 };

  try {
    let totalSize = 0;
    let entryCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16 = 2 bytes per char
          entryCount++;
        }
      }
    }

    // Estimate quota (usually 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB conservative estimate
    
    return {
      sizeKB: Math.round(totalSize / 1024),
      entries: entryCount,
      quotaUsedPercent: Math.round((totalSize / estimatedQuota) * 100)
    };
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return { sizeKB: 0, entries: 0, quotaUsedPercent: 0 };
  }
}

/**
 * Log cache statistics to console
 * Useful for debugging
 */
export function logCacheStats(): void {
  const info = getCacheInfo();
  console.log('📦 AlbionKit Cache Statistics:');
  console.log(`   - Entries: ${info.entries}`);
  console.log(`   - Size: ${info.sizeKB} KB`);
  console.log(`   - Quota Used: ${info.quotaUsedPercent}%`);
  
  if (info.quotaUsedPercent > 80) {
    console.warn('⚠️ Cache is nearly full! Consider clearing it.');
    console.warn('🗑️ Run clearAlbionKitCache() to free up space.');
  }
}

// Auto-log cache stats on import (dev only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logCacheStats();
  }, 2000);
}
