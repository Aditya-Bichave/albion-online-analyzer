
import { Metadata } from 'next';
import LabourClient from './LabourClient';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata: Metadata = createPageMetadata(
  'labour-calc',
  'Labourer Profit Calculator | AlbionKit',
  'Calculate profits for Albion Online labourers. Analyze journal returns, resource yields, and market prices to maximize your island income.'
);

export default function LabourPage() {
  return <LabourClient />;
}
