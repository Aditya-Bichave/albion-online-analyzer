import { Metadata } from 'next';
import GoldPriceClient from './GoldPriceClient';
import { getGoldHistory } from '@/lib/gold-service';
import { getTranslations } from 'next-intl/server';
import { getScreenshotUrl, getFullScreenshotUrl, getScreenshot } from '@/lib/screenshot-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.goldPrice');
  const tPage = await getTranslations('GoldPricePage');
  let title = tPage('title');
  let description = tPage('description');
  const screenshotKey = 'gold-price';

  try {
    // Default to Americas for metadata snapshot
    const history = await getGoldHistory('west', 1);

    if (history && history.length > 0) {
      const currentPrice = history[history.length - 1].price;
      description = t('descriptionDynamic', { price: currentPrice.toLocaleString() });
    }
  } catch (e) {
    console.error('Failed to fetch Gold Price metadata', e);
  }

  return {
    title,
    description,
    keywords: getScreenshot(screenshotKey).keywords.join(', '),
    alternates: {
      canonical: 'https://albionkit.com/tools/gold-price',
    },
    openGraph: {
      title,
      description,
      url: 'https://albionkit.com/tools/gold-price',
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

export default function GoldPricePage() {
  return <GoldPriceClient />;
}
