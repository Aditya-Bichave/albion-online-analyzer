import { Metadata } from 'next';
import WeaponDetailClient from './WeaponDetailClient';
import { getTranslations } from 'next-intl/server';
import { WEAPONS_DATABASE } from '@/data/weapons-database';

type Params = Promise<{ weaponId: string }>;

export async function generateStaticParams() {
  return WEAPONS_DATABASE.map((weapon) => ({
    weaponId: weapon.id,
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { weaponId } = await params;
  const weapon = WEAPONS_DATABASE.find(w => w.id === weaponId);
  const t = await getTranslations('WeaponDetail');

  if (!weapon) {
    return {
      title: 'Weapon Not Found',
    };
  }

  return {
    title: `${weapon.name} - ${t('guide')}`,
    description: `${t('description')} ${weapon.rotation.tips.join(' ')}`,
    alternates: {
      canonical: `https://aditya-bichave.github.io/albion-online-analyzer/guides/combat/weapons/${weaponId}`,
    },
    openGraph: {
      title: `${weapon.name} - ${t('guide')}`,
      description: `${weapon.name} ${t('for')} ${weapon.bestFor.join(', ')}`,
      url: `https://aditya-bichave.github.io/albion-online-analyzer/guides/combat/weapons/${weapon.id}`,
    },
  };
}

export default async function WeaponDetailPage({ params }: { params: Params }) {
  const { weaponId } = await params;
  const weapon = WEAPONS_DATABASE.find(w => w.id === weaponId);

  if (!weapon) {
    return <div>Weapon not found</div>;
  }

  return <WeaponDetailClient weaponId={weaponId} />;
}
