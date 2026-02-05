import type { Metadata } from 'next';
import CookingClient from './CookingClient';

export const metadata: Metadata = {
  title: 'Albion Online Cooking Calculator - Profit & Recipes | AlbionKit',
  description: 'Maximize your Cooking profits in Albion Online. Calculate food crafting costs, focus efficiency, and return rates. Find the most profitable recipes.',
  keywords: ['Albion Online Cooking', 'Cooking Calculator', 'Food Crafting', 'Albion Profit Calculator', 'Albion Online Food', 'Focus Efficiency'],
  openGraph: {
    title: 'Albion Online Cooking Calculator - Profit & Recipes',
    description: 'Calculate food crafting profits, focus efficiency, and return rates. Optimize your cooking economy.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Cooking Calculator - Profit & Recipes',
    description: 'Calculate food crafting profits, focus efficiency, and return rates. Optimize your cooking economy.',
  }
};

export default function CookingPage() {
  return <CookingClient />;
}
