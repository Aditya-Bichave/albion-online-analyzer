import { Metadata } from 'next';
import LabourClient from './LabourClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.labour');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function LabourPage() {
  return <LabourClient />;
}
