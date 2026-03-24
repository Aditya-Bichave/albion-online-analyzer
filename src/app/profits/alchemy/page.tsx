import type { Metadata } from 'next';
import AlchemyClient from './AlchemyClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'alchemy-calc',
  'Albion Online Alchemy Calculator - Profit & Recipes | AlbionKit',
  'Maximize your Alchemy profits in Albion Online. Calculate potion costs, focus efficiency, and return rates. Find the most profitable recipes.'
);

export default function AlchemyPage() {
  return <AlchemyClient />;
}
