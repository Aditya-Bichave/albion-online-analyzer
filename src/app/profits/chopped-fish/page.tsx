import { Metadata } from 'next';
import ChoppedFishClient from './ChoppedFishClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.choppedFish');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ChoppedFishPage() {
  return <ChoppedFishClient />;
}
