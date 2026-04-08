import { Metadata } from 'next';
import EnchantingClient from './EnchantingClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.enchanting');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://albionkit.com/profits/enchanting',
    },
  };
}

export default function EnchantingPage() {
  return <EnchantingClient />;
}
