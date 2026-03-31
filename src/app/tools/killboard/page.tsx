import { Metadata } from 'next';
import KillboardClient from './KillboardClient';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const revalidate = 30;

// Base metadata
const baseMetadata = createPageMetadata(
  'killboard',
  'Killboard - Albion Online PvP Tracker | AlbionKit',
  'Track real-time PvP battles in Albion Online. Killboard with player statistics, fame tracking, and battle analysis across all servers.'
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.killFeed');
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
      url: 'https://albionkit.com/tools/killboard',
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

export default async function KillboardPage() {
  const tNav = await getTranslations('Navbar');
  const tPage = await getTranslations('Pages.killFeed');
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
        item: 'https://albionkit.com/tools/killboard',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <KillboardClient />
    </>
  );
}
