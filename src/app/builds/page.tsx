import { Metadata } from 'next';
import BuildsClient from './BuildsClient';
import { getTranslations } from 'next-intl/server';
import { getScreenshotUrl, getFullScreenshotUrl, getScreenshot } from '@/lib/screenshot-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('BuildsPage');
  const title = t('title');
  const description = t('description');
  const screenshotKey = 'builds-list';

  return {
    title,
    description,
    keywords: getScreenshot(screenshotKey).keywords.join(', '),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/builds',
    },
    openGraph: {
      title,
      description,
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/builds',
      type: 'website',
      images: [{
        url: getFullScreenshotUrl(screenshotKey),
        width: 1200,
        height: 630,
        alt: getScreenshot(screenshotKey).alt,
        type: 'image/png'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getScreenshotUrl(screenshotKey)],
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
