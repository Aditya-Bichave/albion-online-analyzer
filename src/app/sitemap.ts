import { MetadataRoute } from 'next';
import { getAllBuildsForSitemap } from '@/lib/sitemap-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://albionkit.com';

  // 1. Core Pages (Highest Priority)
  const corePages = [
    { route: '', priority: 1, changeFrequency: 'daily' as const },
    { route: '/builds', priority: 0.95, changeFrequency: 'daily' as const },
    { route: '/guides', priority: 0.95, changeFrequency: 'daily' as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // 2. Tools Pages (High Priority)
  const toolsPages = [
    '/tools/market-flipper',
    '/tools/pvp-intel',
    '/tools/gold-price',
    '/tools/killboard',
    '/tools/zvz-tracker',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 3. Profit Calculators (High Priority)
  const profitsPages = [
    '/profits/crafting',
    '/profits/farming',
    '/profits/animal',
    '/profits/cooking',
    '/profits/alchemy',
    '/profits/enchanting',
    '/profits/labour',
    '/profits/chopped-fish',
    '/profits/silver-farming',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // 4. Guide Pages (High Priority - SEO Content)
  const guidePages = [
    '/guides/getting-started',
    '/guides/combat/positioning',
    '/guides/combat/rotations',
    '/guides/combat/weapons',
    '/guides/gathering/routes',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // 5. Community & Info Pages
  const infoPages = [
    '/about',
    '/donate',
    '/privacy',
    '/terms',
    '/cookies',
    '/settings',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 6. Dynamic Routes (Builds) - Top 100 by likes
  const builds = await getAllBuildsForSitemap();
  const buildRoutes = builds.map((build) => ({
    url: `${baseUrl}/builds/${build.id}`,
    lastModified: build.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Combine all sitemap entries
  return [
    ...corePages,
    ...toolsPages,
    ...profitsPages,
    ...guidePages,
    ...infoPages,
    ...buildRoutes,
  ];
}
