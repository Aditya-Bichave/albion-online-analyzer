import { Metadata } from 'next';
import PvpIntelClient from './PvpIntelClient';
import { getPlayerStats, searchPlayer } from './actions';
import { getTranslations } from 'next-intl/server';
import { getScreenshotUrl, getFullScreenshotUrl, getScreenshot } from '@/lib/screenshot-metadata';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations('Pages.pvpIntel');
  const tPage = await getTranslations('PvPIntelPage');
  let title = tPage('title');
  let description = tPage('description');
  const screenshotKey = 'pvp-intel';

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
    title,
    description,
    keywords: getScreenshot(screenshotKey).keywords.join(', '),
    openGraph: {
      title,
      description,
      url: 'https://albionkit.com/tools/pvp-intel',
      type: 'website',
      images: [{
        url: getFullScreenshotUrl(screenshotKey),
        width: 1200,
        height: 630,
        alt: getScreenshot(screenshotKey).alt,
        type: 'image/png'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getScreenshotUrl(screenshotKey)],
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
