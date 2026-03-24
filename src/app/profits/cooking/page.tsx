import type { Metadata } from 'next';
import CookingClient from './CookingClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'cooking-calc',
  'Albion Online Cooking Calculator - Profit & Recipes | AlbionKit',
  'Maximize your Cooking profits in Albion Online. Calculate food crafting costs, focus efficiency, and return rates. Find the most profitable recipes.'
);

export default function CookingPage() {
  return <CookingClient />;
}
