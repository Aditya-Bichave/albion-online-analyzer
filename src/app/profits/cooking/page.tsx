import { Metadata } from 'next';
import CookingClient from './CookingClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.cooking');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: 'https://albionkit.com/profits/cooking',
    },
  };
}

export default function CookingPage() {
  return <CookingClient />;
}
