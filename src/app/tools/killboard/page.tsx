import { Metadata } from 'next';
import KillboardClient from './KillboardClient';
import { getTranslations } from 'next-intl/server';
import { getScreenshotUrl, getFullScreenshotUrl, getScreenshot } from '@/lib/screenshot-metadata';

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.killFeed');
  const title = t('title');
  const description = t('description');
  const screenshotKey = 'killboard';

  return {
    title,
    description,
    keywords: getScreenshot(screenshotKey).keywords.join(', '),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/tools/killboard',
    },
    openGraph: {
      title,
      description,
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/tools/killboard',
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

export default async function KillboardPage() {
  const tNav = await getTranslations('Navbar');
  const tPage = await getTranslations('Pages.killFeed');
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tNav('home'),
        item: 'https://aditya-bichave.github.io/albion-online-analyzer',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tNav('tools'),
        item: 'https://aditya-bichave.github.io/albion-online-analyzer/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tPage('title'),
        item: 'https://aditya-bichave.github.io/albion-online-analyzer/tools/killboard',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <KillboardClient />
    </>
  );
}
