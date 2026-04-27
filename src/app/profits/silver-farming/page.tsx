import { Metadata } from 'next';
import SilverFarmingClient from './SilverFarmingClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SilverFarming');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/silver-farming',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/silver-farming',
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

export default async function SilverFarmingPage() {
  return <SilverFarmingClient />;
}
