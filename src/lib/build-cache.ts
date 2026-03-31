/**
 * Build Cache Service
 * Stores builds in localStorage to reduce Firestore reads
 * Automatically syncs with Firestore in background
 */

const BUILD_CACHE_KEY = 'albionkit_user_builds';
const CACHE_TIMESTAMP_KEY = 'albionkit_builds_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CachedBuild {
  id: string;
  data: any;
  cachedAt: number;
}

/**
 * Get builds from cache
 */
export function getCachedBuilds(userId: string): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cached = localStorage.getItem(BUILD_CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return [];
    
    // Check if cache is stale
    const age = Date.now() - parseInt(timestamp);
    if (age > CACHE_DURATION) {
      console.log('Build cache stale, will refresh from server');
      return JSON.parse(cached).filter((b: any) => b.authorId === userId);
    }
    
    console.log('Loading builds from cache');
    const builds = JSON.parse(cached);
    return builds.filter((b: any) => b.authorId === userId);
  } catch (error) {
    console.error('Error reading build cache:', error);
    return [];
  }
}

/**
 * Save builds to cache
 */
export function cacheBuilds(builds: any[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BUILD_CACHE_KEY, JSON.stringify(builds));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log(`Cached ${builds.length} builds`);
  } catch (error) {
    console.error('Error caching builds:', error);
    // Cache full, clear old data
    localStorage.removeItem(BUILD_CACHE_KEY);
  }
}

/**
 * Add or update a single build in cache
 */
export function cacheBuild(build: any) {
  if (typeof window === 'undefined') return;
  
  try {
    const cached = localStorage.getItem(BUILD_CACHE_KEY);
    const builds: any[] = cached ? JSON.parse(cached) : [];
    
    const existingIndex = builds.findIndex(b => b.id === build.id);
    if (existingIndex >= 0) {
      builds[existingIndex] = build;
    } else {
      builds.push(build);
    }
    
    localStorage.setItem(BUILD_CACHE_KEY, JSON.stringify(builds));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching single build:', error);
  }
}

/**
 * Delete build from cache
 */
export function removeFromCache(buildId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const cached = localStorage.getItem(BUILD_CACHE_KEY);
    if (!cached) return;
    
    const builds: any[] = JSON.parse(cached);
    const filtered = builds.filter(b => b.id !== buildId);
    
    localStorage.setItem(BUILD_CACHE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing build from cache:', error);
  }
}

/**
 * Clear all cached builds
 */
export function clearBuildCache() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(BUILD_CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

/**
 * Check if cache is valid
 */
export function isCacheValid(): boolean {
  if (typeof window === 'undefined') return false;
  
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;
  
  const age = Date.now() - parseInt(timestamp);
  return age <= CACHE_DURATION;
}
