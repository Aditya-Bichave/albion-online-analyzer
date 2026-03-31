import { Metadata } from 'next';
import GettingStartedClient from './GettingStartedClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.gettingStarted');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://albionkit.com/guides/getting-started',
    },
  };
}

export default async function GettingStartedPage() {
  return <GettingStartedClient />;
}
