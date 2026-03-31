import { Metadata } from 'next';
import GatheringRoutesClient from './GatheringRoutesClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.gatheringRoutes');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/gathering/routes',
    },
  };
}

export default async function GatheringRoutesPage() {
  return <GatheringRoutesClient />;
}
