import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/settings/', '/login/', '/admin/'],
    },
    sitemap: 'https://aditya-bichave.github.io/albion-online-analyzer/sitemap.xml',
  };
}
