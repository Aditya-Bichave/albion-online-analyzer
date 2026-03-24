import { Metadata } from 'next';
import MarketFlipperClient from './MarketFlipperClient';
import { getItemNameService } from '@/lib/item-service';
import { getTranslations, getLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'market-flipper',
  'Albion Online Market Flipper - Real-Time Profit Calculator | AlbionKit',
  'Find profitable market flips in Albion Online. Track prices across all cities, set watchlist alerts, and maximize profits with real-time market data. Free tool with premium features.'
);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations('Pages.marketFlipper');
  const locale = await getLocale();
  let title = t('title');
  let description = t('description');

  const resolvedSearchParams = await searchParams;
  const itemId = resolvedSearchParams?.item;

  if (typeof itemId === 'string' && itemId) {
    try {
      const itemName = await getItemNameService(itemId, locale);
      if (itemName) {
        title = `${itemName} - Market Flipper | AlbionKit`;
        description = `Find profitable market flips for ${itemName} in Albion Online. Real-time price tracking and profit calculator.`;
      }
    } catch (e) {
      console.error('Failed to fetch Market Flipper metadata', e);
    }
  }

  // Merge base metadata with dynamic content
  return {
    ...baseMetadata,
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: 'https://albionkit.com/tools/market-flipper',
      images: baseMetadata.openGraph?.images, // Explicitly include screenshot
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: baseMetadata.twitter?.images, // Explicitly include screenshot
    }
  };
}

export default async function MarketFlipperPage() {
  const t = await getTranslations('Pages.marketFlipper');
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Market Flipper - AlbionKit',
    applicationCategory: 'GameUtility',
    operatingSystem: 'Web Browser',
    description: 'Real-time market flipping tool for Albion Online with profit calculator, price alerts, and watchlist tracking.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156'
    },
    featureList: 'Market tracking, Profit calculator, Price alerts, Watchlist, Real-time data, Multi-city comparison'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketFlipperClient />
    </>
  );
}
