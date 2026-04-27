import { Metadata } from 'next';
import GatheringRoutesClient from './GatheringRoutesClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.gatheringRoutes');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/guides/gathering/routes',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/guides/gathering/routes',
      type: 'website',
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Albion Online Analyzer Preview',
        type: 'image/jpeg'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.jpg'],
    }
  };
}

export default async function GatheringRoutesPage() {
  return <GatheringRoutesClient />;
}
