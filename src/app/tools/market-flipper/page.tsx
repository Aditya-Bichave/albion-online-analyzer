import { Metadata } from 'next';
import MarketFlipperClient from './MarketFlipperClient';
import { getItemNameService } from '@/lib/item-service';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  let title = 'Albion Online Market Flipper - Profit Calculator | AlbionKit';
  let description = 'Find the most profitable items to flip in Albion Online. Real-time market data, arbitrage calculator, and historical price charts for all cities and the Black Market.';
  
  const resolvedSearchParams = await searchParams;
  const itemId = resolvedSearchParams?.item;

  if (typeof itemId === 'string' && itemId) {
    try {
      const itemName = await getItemNameService(itemId);
      if (itemName) {
        title = `Flip ${itemName} for Profit - Market Flipper | AlbionKit`;
        description = `Check real-time market prices and arbitrage opportunities for ${itemName}. Compare prices between Royal Cities and the Black Market instantly.`;
      }
    } catch (e) {
      console.error('Failed to fetch Market Flipper metadata', e);
    }
  }

  return {
    title,
    description,
    keywords: ['Albion Online Market Flipper', 'Albion Flipping Tool', 'Albion Market Arbitrage', 'Black Market Flipper', 'Albion Online Economy', 'Albion Trading'],
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['https://albionkit.com/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function MarketFlipperPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AlbionKit Market Flipper',
    applicationCategory: 'GameTool',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A powerful market flipping tool for Albion Online that helps players find arbitrage opportunities between cities.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://albionkit.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://albionkit.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Market Flipper',
        item: 'https://albionkit.com/tools/market-flipper',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketFlipperClient />
    </>
  );
}
