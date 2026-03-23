import { MetadataRoute } from 'next';
import { getAllBuildsForSitemap } from '@/lib/sitemap-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://albionkit.com';

  // 1. Static Routes (Core pages only - all have internal links)
  const routes = [
    '',
    '/builds',
    '/forum',
    '/tools/market-flipper',
    '/tools/pvp-intel',
    '/tools/crafting-calc',
    '/tools/gold-price',
    '/tools/kill-feed',
    '/tools/zvz-tracker',
    '/profits/alchemy',
    '/profits/cooking',
    '/profits/farming',
    '/profits/animal',
    '/profits/chopped-fish',
    '/profits/enchanting',
    '/about',
    '/privacy',
    '/terms',
    '/cookies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : route === '/builds' || route === '/forum' ? 0.9 : 0.8,
  }));

  // 2. Dynamic Routes (Builds) - Limited to top 100 by likes
  const builds = await getAllBuildsForSitemap();
  const buildRoutes = builds.map((build) => ({
    url: `${baseUrl}/builds/${build.id}`,
    lastModified: build.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...buildRoutes];
}
