import { Metadata } from 'next';
import KillFeedClient from './KillFeedClient';
import { getTranslations } from 'next-intl/server';

export const revalidate = 30; // Revalidate every 30 seconds

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.killFeed');
  const title = t('title');
  
  // Use static description - avoids live API call on every page request
  const description = t('description');

  return {
    description,
    keywords: ['Albion Online Kill Feed', 'Live PvP', 'High Value Kills', 'Albion PvP Tracker', 'Real-time Killboard'],
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['https://albionkit.com/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://albionkit.com/tools/kill-feed'
    }
  };
}

export default async function KillFeedPage() {
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
        item: 'https://albionkit.com/tools/kill-feed',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <KillFeedClient />
    </>
  );
}
