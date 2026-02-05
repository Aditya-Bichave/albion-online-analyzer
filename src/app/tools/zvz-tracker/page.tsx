import { Metadata } from 'next';
import { Suspense } from 'react';
import ZvzTrackerClient from './ZvzTrackerClient';
import { getBattles } from './actions';
import { Loader2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  let title = 'ZvZ Tracker | AlbionKit';
  let description = 'Track massive open-world battles and guild warfare in Albion Online.';
  
  try {
    // Default to Americas for metadata snapshot
    const { battles } = await getBattles('west', 10);
    
    if (battles && battles.length > 0) {
      // Filter for "live" battles (last 20 mins)
      const liveBattles = battles.filter((b: any) => new Date(b.startTime).getTime() > Date.now() - 20 * 60 * 1000);
      
      if (liveBattles.length > 0) {
        title = `${liveBattles.length} Live Battles - ZvZ Tracker | AlbionKit`;
        description = `Currently tracking ${liveBattles.length} active battles in Americas. Top battle: ${liveBattles[0].totalKills} kills.`;
      } else {
         description = `Track recent massive battles. Latest: ${battles[0].totalKills} kills in ${battles[0].clusterName || 'Open World'}.`;
      }
    }
  } catch (e) {
    // Fallback if fetch fails
    console.error('Failed to fetch ZvZ metadata', e);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['https://albionkit.com/og-image.jpg'], // Fallback or specific image
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function ZvzTrackerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ZvzTrackerClient />
    </Suspense>
  );
}
