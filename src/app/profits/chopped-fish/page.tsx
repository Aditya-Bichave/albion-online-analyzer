import type { Metadata } from 'next';
import ChoppedFishClient from './ChoppedFishClient';

export const metadata: Metadata = {
  title: 'Albion Online Chopped Fish Calculator - Profit & Yield | AlbionKit',
  description: 'Calculate profits from converting raw fish into chopped fish in Albion Online. Compare yields, market prices, and ROI for all fish tiers.',
  keywords: ['Albion Online Fishing', 'Chopped Fish', 'Fish Yield', 'Albion Profit Calculator', 'Albion Online Market', 'Fishing Profit'],
  openGraph: {
    title: 'Albion Online Chopped Fish Calculator - Profit & Yield',
    description: 'Calculate profits from converting raw fish into chopped fish. Optimize your fishing yield.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Chopped Fish Calculator - Profit & Yield',
    description: 'Calculate profits from converting raw fish into chopped fish. Optimize your fishing yield.',
  }
};

export default function ChoppedFishPage() {
  return <ChoppedFishClient />;
}
