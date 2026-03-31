import { Metadata } from 'next';
import CombatPositioningClient from './CombatPositioningClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.combatPositioning');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/combat/positioning',
    },
  };
}

export default async function CombatPositioningPage() {
  return <CombatPositioningClient />;
}
