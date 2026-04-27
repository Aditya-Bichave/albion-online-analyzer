import { Metadata } from 'next';
import FarmingClient from './FarmingClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.farming');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/farming',
    },
  };
}

export default function FarmingPage() {
  return <FarmingClient />;
}
