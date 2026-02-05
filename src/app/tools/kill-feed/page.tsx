import { Metadata } from 'next';
import KillFeedClient from './KillFeedClient';
import { fetchRecentEvents } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  let title = 'Live Kill Feed - Real-time Albion Online PvP | AlbionKit';
  let description = 'Watch the action unfold with the Albion Online Live Kill Feed. Track high-value kills, guild battles, and zone activity in real-time.';
  
  try {
    const result = await fetchRecentEvents('west', 1);
    const events = result.events;
    if (events && events.length > 0) {
      const latest = events[0];
      const killer = latest.Killer.Name;
      const victim = latest.Victim.Name;
      const fame = latest.TotalVictimKillFame.toLocaleString();
      description = `Live: ${killer} just killed ${victim} for ${fame} Fame! Track real-time PvP kills, battles, and loot in Albion Online.`;
    }
  } catch (e) {
    console.error('Failed to fetch Kill Feed metadata', e);
  }

  return {
    title,
    description,
    keywords: ['Albion Online Kill Feed', 'Live PvP', 'High Value Kills', 'Albion PvP Tracker', 'Real-time Killboard'],
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['https://albionkit.com/og-image.jpg'], // Fallback or dynamic if we had event images
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function KillFeedPage() {
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
        name: 'Kill Feed',
        item: 'https://albionkit.com/tools/kill-feed',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <KillFeedClient />
    </>
  );
}
