import type { Metadata } from 'next';
import EnchantingClient from './EnchantingClient';

export const metadata: Metadata = {
  title: 'Albion Online Enchanting Calculator - Profit & Cost | AlbionKit',
  description: 'Calculate enchanting profits in Albion Online. Compare costs of runes, souls, and relics versus buying pre-enchanted gear. Optimize your enchanting strategy.',
  keywords: ['Albion Online Enchanting', 'Enchanting Calculator', 'Runes Souls Relics', 'Albion Profit Calculator', 'Albion Online Crafting', 'Gear Enchanting'],
  openGraph: {
    title: 'Albion Online Enchanting Calculator - Profit & Cost',
    description: 'Calculate enchanting profits and costs. Optimize your gear enchanting strategy.',
    type: 'website',
    images: ['https://albionkit.com/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Enchanting Calculator - Profit & Cost',
    description: 'Calculate enchanting profits and costs. Optimize your gear enchanting strategy.',
  }
};

export default function EnchantingPage() {
  return <EnchantingClient />;
}
