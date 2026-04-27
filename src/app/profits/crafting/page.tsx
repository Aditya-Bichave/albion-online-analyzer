import { Metadata } from 'next';
import CraftingCalcClient from './CraftingCalcClient';
import { getTranslations } from 'next-intl/server';
import { getScreenshotUrl, getFullScreenshotUrl, getScreenshot } from '@/lib/screenshot-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('CraftingPage');
  const tNav = await getTranslations('Navbar');
  const title = t('title');
  const description = t('description');
  const screenshotKey = 'crafting-calc';

  return {
    title,
    description,
    keywords: getScreenshot(screenshotKey).keywords.join(', '),
    alternates: {
      canonical: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/crafting',
    },
    openGraph: {
      title,
      description,
      url: 'https://aditya-bichave.github.io/albion-online-analyzer/profits/crafting',
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

export default function CraftingPage() {
  return <CraftingCalcClient />;
}
