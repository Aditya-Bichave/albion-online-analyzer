import { Metadata } from 'next';
import GettingStartedClient from './GettingStartedClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.gettingStarted');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://albionkit.com/guides/getting-started',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/getting-started',
      type: 'website',
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AlbionKit Preview',
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

export default async function GettingStartedPage() {
  return <GettingStartedClient />;
}
