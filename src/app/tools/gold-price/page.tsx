import { Metadata } from 'next';
import GoldPriceClient from './GoldPriceClient';
import { getGoldHistory } from '@/lib/gold-service';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'gold-price',
  'Gold Price Calculator - Albion Online Premium Tracker | AlbionKit',
  'Compare gold prices across all Albion Online servers. Track premium conversion rates and find the best deals for gold trading.'
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.goldPrice');
  let title = t('title');
  let description = t('description');

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
    ...baseMetadata,
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: 'https://albionkit.com/tools/gold-price',
      images: baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: baseMetadata.twitter?.images,
    }
  };
}

export default function GoldPricePage() {
  return <GoldPriceClient />;
}
