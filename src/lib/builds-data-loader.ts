// Builds data loader - loads builds from local JSON file
import buildsData from '@/data/builds.json';
import buildStats from '@/data/build-stats.json';

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

export type BuildCategory = 'solo' | 'small-scale' | 'pvp' | 'zvz' | 'large-scale' | 'group';

export interface BuildEquipment {
  MainHand?: { Type: string };
  OffHand?: { Type: string };
  Head?: { Type: string };
  Armor?: { Type: string };
  Shoes?: { Type: string };
  Bag?: { Type: string };
  Cape?: { Type: string };
  Mount?: { Type: string };
  Potion?: { Type: string };
  Food?: { Type: string };
  Inventory?: Array<{ Type: string; Amount: number }>;
}

// Add IDs to builds if they don't have them and merge stats
const buildsById = buildsData.reduce((acc, build, index) => {
  const id = build.id || `build_${index}`;
  const stats = buildStats[id as keyof typeof buildStats] || {};

  acc[id] = {
    ...build,
    id,
    category: build.category as BuildCategory,
    mobility: build.mobility as Build['mobility'],
    difficulty: build.difficulty as Build['difficulty'],
    likes: stats.likes || 0,
    views: stats.views || 0,
    rating: stats.rating || 0,
    ratingCount: stats.ratingCount || 0
  };
  return acc;
}, {} as Record<string, Build>);

const buildsArray = Object.values(buildsById);

/**
 * Get all builds
 */
export function getAllBuilds(): Build[] {
  return buildsArray;
}

/**
 * Get build by ID
 */
export function getBuildById(id: string): Build | undefined {
  return buildsById[id];
}

/**
 * Search builds by query and filters
 */
export function searchBuilds(options: {
  query?: string;
  category?: BuildCategory;
  tags?: string[];
  zoneTags?: string[];
  activityTags?: string[];
  roleTags?: string[];
  sortBy?: 'recent' | 'popular' | 'rating' | 'likes';
  page?: number;
  limit?: number;
}): { builds: Build[]; total: number } {
  const {
    query,
    category,
    tags,
    zoneTags,
    activityTags,
    roleTags,
    sortBy = 'recent',
    page = 1,
    limit = 24
  } = options;

  console.log('searchBuilds called with options:', { query, category, tags, zoneTags, activityTags, roleTags, page, limit });
  console.log('Total builds in database:', buildsArray.length);

  let filtered = [...buildsArray];

  // Category filter
  if (category) {
    filtered = filtered.filter(build => build.category === category);
  }

  // Tag filters - only apply if arrays exist and have length
  if (tags && tags.length > 0) {
    console.log('Filtering by tags:', tags);
    filtered = filtered.filter(build =>
      build.tags?.some(tag => tags.includes(tag))
    );
  }

  if (zoneTags && zoneTags.length > 0) {
    console.log('Filtering by zoneTags:', zoneTags);
    filtered = filtered.filter(build =>
      build.tags?.some(tag => zoneTags.includes(tag))
    );
  }

  if (activityTags && activityTags.length > 0) {
    console.log('Filtering by activityTags:', activityTags);
    filtered = filtered.filter(build =>
      build.tags?.some(tag => activityTags.includes(tag))
    );
  }

  if (roleTags && roleTags.length > 0) {
    console.log('Filtering by roleTags:', roleTags);
    filtered = filtered.filter(build =>
      build.tags?.some(tag => roleTags.includes(tag))
    );
  }

  console.log('Filtered builds count:', filtered.length);

  // Text search
  if (query) {
    const queryLower = query.toLowerCase();
    filtered = filtered.filter(build =>
      build.title.toLowerCase().includes(queryLower) ||
      build.description.toLowerCase().includes(queryLower) ||
      (build.authorName || '').toLowerCase().includes(queryLower)
    );
  }

  // Sorting
  switch (sortBy) {
    case 'popular':
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'likes':
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    case 'recent':
    default:
      // Sort by ID for consistent ordering
      filtered.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      break;
  }

  const total = filtered.length;

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBuilds = filtered.slice(startIndex, endIndex);

  return {
    builds: paginatedBuilds,
    total
  };
}

/**
 * Get all unique tags from builds
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  buildsArray.forEach(build => {
    build.tags?.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get zone tags
 */
export function getZoneTags(): string[] {
  const zonePrefixes = ['open_world', 'crystal_tower', 'territory', 'roads_avalon', 'ava-dungeon'];
  return getAllTags().filter(tag => zonePrefixes.some(prefix => tag.startsWith(prefix) || tag === prefix));
}

/**
 * Get activity tags
 */
export function getActivityTags(): string[] {
  const activityPrefixes = ['fame', 'silver', 'gathering', 'crafting', 'lore'];
  return getAllTags().filter(tag => activityPrefixes.some(prefix => tag.startsWith(prefix) || tag === prefix));
}

/**
 * Get role tags
 */
export function getRoleTags(): string[] {
  const rolePrefixes = ['tank', 'healer', 'dps', 'support'];
  return getAllTags().filter(tag => rolePrefixes.some(prefix => tag.startsWith(prefix) || tag === prefix));
}

/**
 * Get builds by category
 */
export function getBuildsByCategory(category: BuildCategory): Build[] {
  return buildsArray.filter(build => build.category === category);
}

/**
 * Get similar builds (same category and tags)
 */
export function getSimilarBuilds(build: Build, limit: number = 4): Build[] {
  const similar = buildsArray
    .filter(b => b.id !== build.id && b.category === build.category)
    .filter(b => {
      const buildTags = new Set(build.tags || []);
      const otherTags = new Set(b.tags || []);
      const intersection = [...buildTags].filter(tag => otherTags.has(tag));
      return intersection.length >= 2;
    })
    .slice(0, limit);

  return similar;
}

/**
 * Generate a slug from build title and ID
 */
export function generateBuildSlug(title: string, id: string): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sanitized}-${id.slice(-4)}`;
}

/**
 * Get build by slug
 */
export function getBuildBySlug(slug: string): Build | undefined {
  // Extract ID from slug (last 4 characters after last dash)
  const lastDashIndex = slug.lastIndexOf('-');
  if (lastDashIndex === -1) return undefined;
  
  const id = slug.slice(lastDashIndex + 1);
  const fullId = Object.keys(buildsById).find(key => key.endsWith(id));
  
  if (!fullId) return undefined;
  return buildsById[fullId];
}

/**
 * Get all builds with slugs
 */
export function getAllBuildsWithSlugs(): Array<Build & { slug: string }> {
  return buildsArray.map(build => ({
    ...build,
    slug: generateBuildSlug(build.title, build.id || '')
  }));
}
