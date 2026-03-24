import type { Metadata } from 'next';
import AnimalClient from './AnimalClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'animal-calc',
  'Albion Online Animal Breeding Calculator - Profit & Growth | AlbionKit',
  'Maximize your Animal Breeding profits in Albion Online. Calculate growth times, food consumption, offspring rates, and market profits for all animals and mounts.'
);

export default function AnimalPage() {
  return <AnimalClient />;
}
