import { Metadata } from 'next';
import BuildsClient from './BuildsClient';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'builds-list',
  'Builds Database - AlbionKit',
  'Browse thousands of meta builds for all weapons and game modes in Albion Online. Filter by category, sort by popularity, and discover builds from top players.'
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Builds');

  return {
    ...baseMetadata,
    title: `${t('title')} | AlbionKit`,
    description: t('description'),
    openGraph: {
      ...baseMetadata.openGraph,
      title: `${t('title')} | AlbionKit`,
      description: t('description'),
      images: baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: `${t('title')} | AlbionKit`,
      description: t('description'),
      images: baseMetadata.twitter?.images,
    }
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BuildsIndexPage({ searchParams }: Props) {
  // BuildsClient reads filters from URL params directly
  return <BuildsClient />;
}
