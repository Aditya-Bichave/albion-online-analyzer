import type { Metadata } from 'next';
import AnimalClient from './AnimalClient';

export const metadata: Metadata = {
  title: 'Albion Online Animal Breeding Calculator - Profit & Growth | AlbionKit',
  description: 'Maximize your Animal Breeding profits in Albion Online. Calculate growth times, food consumption, offspring rates, and market profits for all animals and mounts.',
  keywords: ['Albion Online Breeding', 'Animal Calculator', 'Mount Crafting', 'Albion Profit Calculator', 'Albion Online Animals', 'Pasture Profit'],
  openGraph: {
    title: 'Albion Online Animal Breeding Calculator - Profit & Growth',
    description: 'Calculate animal breeding profits, growth times, and offspring rates. Optimize your pasture and kennel economy.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Animal Breeding Calculator - Profit & Growth',
    description: 'Calculate animal breeding profits, growth times, and offspring rates. Optimize your pasture and kennel economy.',
  }
};

export default function AnimalPage() {
  return <AnimalClient />;
}
