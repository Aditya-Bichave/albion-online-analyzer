import { Metadata } from 'next';
import PvpIntelClient from './PvpIntelClient';
import { getPlayerStats, searchPlayer } from './actions';

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
      // If it looks like an ID (UUID format usually, but Albion IDs are strings)
      // We might need to search first if it's a name
      let playerId = playerQuery;
      let playerName = playerQuery;

      // Try to fetch stats directly assuming it might be an ID or Name
      // Ideally we would search first if we don't have ID
      // For metadata, let's assume the URL might contain ID or we do a quick search
      const searchResults = await searchPlayer(playerQuery, region);
      if (searchResults && searchResults.results && searchResults.results.length > 0) {
         const player = searchResults.results[0];
         playerId = player.Id;
         playerName = player.Name;
         
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
    title,
    description,
    keywords: ['Albion Online PvP', 'Albion Killboard', 'Player Stats', 'Guild Stats', 'Albion ZvZ', 'PvP Analysis'],
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['https://albionkit.com/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
