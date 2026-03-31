import { Metadata } from 'next';
import SilverFarmingClient from './SilverFarmingClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SilverFarming');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/profits/silver-farming',
    },
  };
}

export default async function SilverFarmingPage() {
  return <SilverFarmingClient />;
}
