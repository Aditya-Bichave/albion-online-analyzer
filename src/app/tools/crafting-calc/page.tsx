import { Metadata } from 'next';
import CraftingCalcClient from './CraftingCalcClient';

export const metadata: Metadata = {
  title: 'Albion Online Crafting Calculator - Profit & Focus Tool | AlbionKit',
  description: 'Calculate crafting profits, focus efficiency, and resource return rates (R.R.R) for any item in Albion Online. Optimize your economy.',
  keywords: ['Albion Online Crafting', 'Crafting Calculator', 'Focus Efficiency', 'Albion Profit Calculator', 'Crafting Tool', 'Resource Return Rate'],
  openGraph: {
    title: 'Albion Online Crafting Calculator - Profit & Focus Tool',
    description: 'Maximize your crafting profits. Calculate costs, focus efficiency, and return rates for weapons, armor, and consumables.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Crafting Calculator - Profit & Focus Tool',
    description: 'Maximize your crafting profits. Calculate costs, focus efficiency, and return rates for weapons, armor, and consumables.',
  }
};

export default function CraftingCalcPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://albionkit.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://albionkit.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Crafting Calculator',
        item: 'https://albionkit.com/tools/crafting-calc',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CraftingCalcClient />
    </>
  );
}
