import { Metadata } from 'next';
import AnimalClient from './AnimalClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.animal');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/animal',
    },
  };
}

export default function AnimalPage() {
  return <AnimalClient />;
}
