import type { Metadata } from 'next';
import ChoppedFishClient from './ChoppedFishClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'chopped-fish-calc',
  'Albion Online Chopped Fish Calculator - Profit & Yield | AlbionKit',
  'Calculate profits from converting raw fish into chopped fish in Albion Online. Compare yields, market prices, and ROI for all fish tiers.'
);

export default function ChoppedFishPage() {
  return <ChoppedFishClient />;
}
