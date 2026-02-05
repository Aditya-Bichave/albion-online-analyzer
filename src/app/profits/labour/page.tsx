
import { Metadata } from 'next';
import LabourClient from './LabourClient';

export const metadata: Metadata = {
  title: 'Labourer Profit Calculator | AlbionKit',
  description: 'Calculate profits for Albion Online labourers. Analyze journal returns, resource yields, and market prices to maximize your island income.',
  keywords: ['Albion Online', 'Labourer Calculator', 'Journal Profit', 'Island Income', 'Resource Returns', 'Albion Economy', 'Blacksmith', 'Fletcher', 'Imbuer', 'Tinker'],
  openGraph: {
    title: 'Labourer Profit Calculator | AlbionKit',
    description: 'Maximize your island income with our Albion Online Labourer Profit Calculator. Compare journal costs vs returns for all labourer types.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labourer Profit Calculator | AlbionKit',
    description: 'Maximize your island income with our Albion Online Labourer Profit Calculator.',
  },
};

export default function LabourPage() {
  return <LabourClient />;
}
