// Builds service - simplified for read-only JSON-based builds
import { getAllBuilds, getBuildById, searchBuilds, getSimilarBuilds } from './builds-data-loader';

export type BuildCategory = 'solo' | 'small-scale' | 'pvp' | 'zvz' | 'large-scale' | 'group';

export interface BuildItem {
  Type: string;
  Quality?: number;
  Alternatives?: string[];
}

export interface BuildEquipment {
  MainHand?: BuildItem;
  OffHand?: BuildItem;
  Head?: BuildItem;
  Armor?: BuildItem;
  Shoes?: BuildItem;
  Cape?: BuildItem;
  Potion?: BuildItem;
  Food?: BuildItem;
  Mount?: BuildItem;
  Bag?: BuildItem;
}

export interface Build {
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  category: BuildCategory;
  items: BuildEquipment;
  authorName?: string;
  authorId?: string;
  rating?: number;
  ratingCount?: number;
  likes?: number;
  views?: number;
  tags?: string[];
  youtubeLink?: string;
  strengths?: string[];
  weaknesses?: string[];
  mobility?: 'low' | 'medium' | 'high';
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Pagination result type
export interface PaginatedBuilds {
  builds: Build[];
  lastDoc: any;
  hasMore: boolean;
  total?: number;
  currentPage?: number;
}

// Filter options type
export interface BuildFilters {
  sort?: 'recent' | 'popular' | 'rating' | 'likes';
  tag?: string;
  zoneTags?: string[];
  activityTags?: string[];
  roleTags?: string[];
  search?: string;
  limit?: number;
  page?: number;
}

const PAGE_SIZE = 24;

/**
 * Get paginated builds with filters
 */
export async function getPaginatedBuilds(
  filters: BuildFilters = {}
): Promise<PaginatedBuilds> {
  const page = filters.page || 1;
  
  console.log('getPaginatedBuilds called with:', { filters, page });

  const { sort = 'recent', tag, zoneTags, activityTags, roleTags, search } = filters;

  const result = searchBuilds({
    query: search,
    category: undefined,
    tags: tag ? [tag] : undefined,
    zoneTags,
    activityTags,
    roleTags,
    sortBy: sort,
    page,
    limit: PAGE_SIZE
  });

  console.log('searchBuilds result:', { total: result.total, buildsCount: result.builds.length });

  return {
    builds: result.builds,
    lastDoc: null,
    hasMore: page * PAGE_SIZE < result.total,
    total: result.total,
    currentPage: page
  };
}

/**
 * Get build by ID
 */
export async function getBuild(id: string): Promise<Build | null> {
  return getBuildById(id) || null;
}

/**
 * Get similar builds
 */
export async function getSimilarBuildsService(build: Build, limit: number = 4): Promise<Build[]> {
  return getSimilarBuilds(build, limit);
}

/**
 * Get all builds (for caching)
 */
export function getAllBuildsService(): Build[] {
  return getAllBuilds();
}

/**
 * Search builds (for search action)
 */
export function searchBuildsService(query: string, matchedItemIds?: string[]): Build[] {
  const result = searchBuilds({ query, limit: 10 });
  let builds = result.builds;
  
  // Filter by matched item IDs if provided
  if (matchedItemIds && matchedItemIds.length > 0) {
    builds = builds.filter(build => {
      const items = build.items;
      if (!items) return false;
      
      // Check if any build item matches the searched item IDs
      const buildItemIds = Object.values(items)
        .filter((item): item is BuildItem => item !== null && item !== undefined)
        .flatMap(item => [item.Type, ...(item.Alternatives || [])]);
      
      return buildItemIds.some(id => matchedItemIds.includes(id));
    });
  }
  
  return builds;
}

// Stub functions for backwards compatibility (read-only mode)
export async function toggleBuildLike(buildId: string): Promise<{ liked: boolean }> {
  return { liked: false };
}

export async function getBuildLikeStatus(buildId: string): Promise<{ liked: boolean }> {
  return { liked: false };
}

export async function rateBuild(buildId: string, rating: number): Promise<void> {
  // Read-only mode - ratings disabled
}

export async function getBuildUserRating(buildId: string): Promise<{ rating: number } | null> {
  return null;
}

export async function getBuilds(limit?: number): Promise<Build[]> {
  const all = getAllBuilds();
  return limit ? all.slice(0, limit) : all;
}

export async function hideBuild(buildId: string): Promise<void> {
  // Read-only mode - hide disabled
}
