import type { Metadata } from 'next';
import AlchemyClient from './AlchemyClient';

export const metadata: Metadata = {
  title: 'Albion Online Alchemy Calculator - Profit & Recipes | AlbionKit',
  description: 'Maximize your Alchemy profits in Albion Online. Calculate potion costs, focus efficiency, and return rates. Find the most profitable recipes.',
  keywords: ['Albion Online Alchemy', 'Alchemy Calculator', 'Potion Crafting', 'Albion Profit Calculator', 'Albion Online Potions', 'Focus Efficiency'],
  openGraph: {
    title: 'Albion Online Alchemy Calculator - Profit & Recipes',
    description: 'Calculate potion crafting profits, focus efficiency, and return rates. Optimize your alchemy economy.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'], 
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Alchemy Calculator - Profit & Recipes',
    description: 'Calculate potion crafting profits, focus efficiency, and return rates. Optimize your alchemy economy.',
  }
};

export default function AlchemyPage() {
  return <AlchemyClient />;
}
