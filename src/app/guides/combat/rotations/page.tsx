import { Metadata } from 'next';
import CombatRotationsClient from './CombatRotationsClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.combatRotations');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://albionkit.com/guides/combat/rotations',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/combat/rotations',
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

export default async function CombatRotationsPage() {
  return <CombatRotationsClient />;
}
