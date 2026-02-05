import type { Metadata } from 'next';
import FarmingClient from './FarmingClient';

export const metadata: Metadata = {
  title: 'Albion Online Farming Calculator - Crop & Herb Profit | AlbionKit',
  description: 'Maximize your Farming profits in Albion Online. Calculate seed return rates, focus efficiency, and market profits for all crops and herbs.',
  keywords: ['Albion Online Farming', 'Crop Calculator', 'Herb Garden', 'Albion Profit Calculator', 'Albion Online Agriculture', 'Focus Efficiency'],
  openGraph: {
    title: 'Albion Online Farming Calculator - Crop & Herb Profit',
    description: 'Calculate farming profits, seed return rates, and focus efficiency. Optimize your island farm plots.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Farming Calculator - Crop & Herb Profit',
    description: 'Calculate farming profits, seed return rates, and focus efficiency. Optimize your island farm plots.',
  }
};

export default function FarmingPage() {
  return <FarmingClient />;
}
