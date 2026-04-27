import { Metadata } from 'next';
import GuidesClient from './GuidesClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.guides');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/guides',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/guides',
    },
  };
}

export default async function GuidesPage() {
  return <GuidesClient />;
}
