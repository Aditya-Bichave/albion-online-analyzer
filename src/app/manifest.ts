import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Albion Online Analyzer - The Ultimate Albion Online Companion',
    short_name: 'Albion Online Analyzer',
    description: 'Master Albion Online with Albion Online Analyzer. Features include a powerful Build Database, Market Flipper, PvP Intel, Crafting Calculator, and real-time Killboard.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0a09', // stone-950 (background)
    theme_color: '#f59e0b', // amber-500 (primary)
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
