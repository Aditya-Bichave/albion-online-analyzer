import { Metadata } from 'next';
import CombatRotationsClient from './CombatRotationsClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.combatRotations');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/combat/rotations',
    },
  };
}

export default async function CombatRotationsPage() {
  return <CombatRotationsClient />;
}
