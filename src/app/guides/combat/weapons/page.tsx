import { Metadata } from 'next';
import WeaponsListClient from './WeaponsListClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.weaponsList');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/combat/weapons',
    },
  };
}

export default async function WeaponsListPage() {
  return <WeaponsListClient />;
}
