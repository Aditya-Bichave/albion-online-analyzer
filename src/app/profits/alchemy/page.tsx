import { Metadata } from 'next';
import AlchemyClient from './AlchemyClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.alchemy');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://albionkit.com/profits/alchemy',
    },
  };
}

export default function AlchemyPage() {
  return <AlchemyClient />;
}
