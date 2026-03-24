import type { Metadata } from 'next';
import FarmingClient from './FarmingClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'farming-calc',
  'Albion Online Farming Calculator - Crop & Herb Profit | AlbionKit',
  'Maximize your Farming profits in Albion Online. Calculate seed return rates, focus efficiency, and market profits for all crops and herbs.'
);

export default function FarmingPage() {
  return <FarmingClient />;
}
