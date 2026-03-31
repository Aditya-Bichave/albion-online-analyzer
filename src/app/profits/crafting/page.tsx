import type { Metadata } from 'next';
import CraftingCalcClient from './CraftingCalcClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'crafting-calc',
  'Albion Online Crafting Calculator - Resource & Focus Profit | AlbionKit',
  'Maximize your Crafting profits in Albion Online. Calculate resource costs, focus efficiency, and market profits for all crafting stations.'
);

export default function CraftingPage() {
  return <CraftingCalcClient />;
}
