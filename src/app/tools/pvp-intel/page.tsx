import { Metadata } from 'next';
import PvpIntelClient from './PvpIntelClient';
import { getPlayerStats, searchPlayer } from './actions';
import { createPageMetadata } from '@/lib/screenshot-metadata';

// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'pvp-intel',
  'PvP Intel - Albion Online Player & Guild Stats | AlbionKit',
  'Analyze Albion Online PvP stats with precision. Search players, guilds, and battles to view kill fame, K/D ratios, and recent combat history.'
);

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  let title = 'Albion Online PvP Intel - Player & Guild Stats | AlbionKit';
  let description = 'Analyze Albion Online PvP stats with precision. Search players, guilds, and battles to view kill fame, K/D ratios, and recent combat history.';

  const resolvedSearchParams = await searchParams;
  const playerQuery = resolvedSearchParams?.player;
  const region = (resolvedSearchParams?.region as 'west' | 'east' | 'europe') || 'west';

  if (typeof playerQuery === 'string' && playerQuery) {
    try {
      const searchResults = await searchPlayer(playerQuery, region);
      if (searchResults && searchResults.results && searchResults.results.length > 0) {
         const player = searchResults.results[0];
         const playerId = player.Id;
         const playerName = player.Name;

         const { stats } = await getPlayerStats(playerId, region);
         if (stats) {
            title = `${playerName} - PvP Stats & Analysis | AlbionKit`;
            description = `${playerName} has ${stats.KillFame.toLocaleString()} Kill Fame and ${stats.DeathFame.toLocaleString()} Death Fame. K/D Ratio: ${stats.FameRatio.toFixed(2)}. Analyze full combat history now.`;
         }
      }
    } catch (e) {
      console.error('Failed to fetch PvP Intel metadata', e);
    }
  }

  return {
    ...baseMetadata,
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: 'https://albionkit.com/tools/pvp-intel',
      images: baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: baseMetadata.twitter?.images,
    }
  };
}

export default function PvpIntelPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://albionkit.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://albionkit.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'PvP Intel',
        item: 'https://albionkit.com/tools/pvp-intel',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PvpIntelClient />
    </>
  );
}
