import { Metadata } from 'next';
import GoldPriceClient from './GoldPriceClient';
import { getGoldHistory } from '@/lib/gold-service';

export async function generateMetadata(): Promise<Metadata> {
  let title = 'Gold Price Tracker | AlbionKit';
  let description = 'Track the gold-to-silver exchange rate history and trends in Albion Online.';

  try {
    // Default to Americas for metadata snapshot
    const history = await getGoldHistory('west', 1);
    
    if (history && history.length > 0) {
      const currentPrice = history[history.length - 1].price;
      title = `Gold Price: ${currentPrice.toLocaleString()} Silver | AlbionKit`;
      description = `Current Gold Price is ${currentPrice.toLocaleString()} Silver. Track history, calculate premium costs, and analyze market trends.`;
    }
  } catch (e) {
    console.error('Failed to fetch Gold Price metadata', e);
  }

  return {
    title,
    description,
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

export default function GoldPricePage() {
  return <GoldPriceClient />;
}
