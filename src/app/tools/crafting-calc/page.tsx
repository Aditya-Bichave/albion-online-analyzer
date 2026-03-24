import { Metadata } from 'next';
import CraftingCalcClient from './CraftingCalcClient';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'crafting-calc',
  'Crafting Calculator - Albion Online Profit Optimizer | AlbionKit',
  'Maximize your crafting profits in Albion Online. Calculate costs, optimize focus points, and find the most profitable crafts.'
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.crafting');
  const title = t('title');
  const description = t('description');
  
  return {
    ...baseMetadata,
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: 'https://albionkit.com/tools/crafting-calc',
      images: baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: baseMetadata.twitter?.images,
    }
  };
}

export default async function CraftingCalcPage() {
  const tNav = await getTranslations('Navbar');
  const tPage = await getTranslations('Pages.crafting');
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tNav('home'),
        item: 'https://albionkit.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tNav('tools'),
        item: 'https://albionkit.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tPage('title'),
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
