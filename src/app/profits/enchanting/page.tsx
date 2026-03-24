import type { Metadata } from 'next';
import EnchantingClient from './EnchantingClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'enchanting-calc',
  'Albion Online Enchanting Calculator - Profit & Cost | AlbionKit',
  'Calculate enchanting profits in Albion Online. Compare costs of runes, souls, and relics versus buying pre-enchanted gear. Optimize your enchanting strategy.'
);

export default function EnchantingPage() {
  return <EnchantingClient />;
}
