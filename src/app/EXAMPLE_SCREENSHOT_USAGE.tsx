/**
 * Example: How to add screenshots to your pages
 * 
 * This file shows different patterns for integrating screenshots
 */

import type { Metadata } from 'next';
import { createPageMetadata, getScreenshotUrl, getFullScreenshotUrl } from '@/lib/screenshot-metadata';

// ============================================================================
// METHOD 1: Quick Setup (Recommended for most pages)
// ============================================================================

export const metadata: Metadata = createPageMetadata(
  'market-flipper', // Screenshot key
  'Market Flipper - AlbionKit', // Page title
  'Find profitable market flips in real-time with our advanced market flipper tool for Albion Online.', // Description
  {
    includeTwitter: true, // Include Twitter card metadata
    canonicalUrl: 'https://albionkit.com/tools/market-flipper' // Optional canonical URL
  }
);

// This automatically adds:
// - Open Graph tags with screenshot
// - Twitter card with screenshot
// - Keywords from screenshots.json
// - Proper image dimensions and alt text

// ============================================================================
// METHOD 2: Manual Setup (More control)
// ============================================================================

/*
export const metadata: Metadata = {
  title: 'Market Flipper - AlbionKit',
  description: 'Find profitable market flips in real-time...',
  keywords: ['market flipper', 'silver farming', 'trading', 'albion online'],
  
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://albionkit.com/tools/market-flipper',
    siteName: 'AlbionKit',
    title: 'Market Flipper - AlbionKit',
    description: 'Find profitable market flips in real-time...',
    images: [
      {
        url: getFullScreenshotUrl('market-flipper'),
        width: 1920,
        height: 1080,
        alt: 'AlbionKit Market Flipper Tool showing real-time profits',
        type: 'image/png'
      },
      {
        url: getFullScreenshotUrl('homepage'), // Fallback image
        width: 1200,
        height: 630,
        alt: 'AlbionKit - The Ultimate Albion Online Companion',
        type: 'image/png'
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Market Flipper - AlbionKit',
    description: 'Find profitable market flips in real-time...',
    images: [getScreenshotUrl('market-flipper')],
    creator: '@AlbionKit' // Your Twitter handle
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};
*/

// ============================================================================
// METHOD 3: Dynamic Pages (Builds, Users, etc.)
// ============================================================================

/*
interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const build = await getBuild(params.id); // Your data fetching
  
  return {
    title: `${build.title} - AlbionKit Build`,
    description: build.description,
    
    openGraph: {
      title: `${build.title} - AlbionKit`,
      description: build.description,
      images: [
        {
          url: getFullScreenshotUrl('build-detail'),
          width: 1920,
          height: 1080,
          alt: `Albion Online build: ${build.title}`
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${build.title} - AlbionKit`,
      description: build.description,
      images: [getScreenshotUrl('build-detail')]
    }
  };
}
*/

// ============================================================================
// EXAMPLE: Complete Page Implementation
// ============================================================================

/*
import { MarketFlipperClient } from './MarketFlipperClient';

export const metadata: Metadata = createPageMetadata(
  'market-flipper',
  'Market Flipper - AlbionKit',
  'Find profitable market flips in real-time with our advanced market flipper tool for Albion Online. Track prices across all cities and maximize your silver profits.'
);

export default function MarketFlipperPage() {
  return (
    <MarketFlipperClient />
  );
}
*/

// ============================================================================
// EXAMPLE: Profit Calculator Page
// ============================================================================

/*
import { FarmingCalculatorClient } from './FarmingCalculatorClient';

export const metadata: Metadata = createPageMetadata(
  'farming-calc',
  'Farming Calculator - AlbionKit',
  'Calculate farming profits for all crops in Albion Online. Optimize your focus points and maximize silver per hour.'
);

export default function FarmingCalculatorPage() {
  return (
    <FarmingCalculatorClient />
  );
}
*/

// ============================================================================
// EXAMPLE: Tool Page (Kill Feed, ZvZ Tracker, etc.)
// ============================================================================

/*
import { KillFeedClient } from './KillFeedClient';

export const metadata: Metadata = createPageMetadata(
  'kill-feed',
  'Kill Feed - AlbionKit',
  'Live PvP kill feed for Albion Online. Track battles, players, and guilds in real-time across all servers.'
);

export default function KillFeedPage() {
  return (
    <KillFeedClient />
  );
}
*/

// ============================================================================
// EXAMPLE: Builds List Page
// ============================================================================

/*
import { BuildsClient } from './BuildsClient';

export const metadata: Metadata = createPageMetadata(
  'builds-list',
  'Builds Database - AlbionKit',
  'Browse thousands of meta builds for all weapons and game modes in Albion Online. Filter by category, sort by popularity, and discover builds from top players.'
);

export default function BuildsPage() {
  return (
    <BuildsClient />
  );
}
*/

// ============================================================================
// EXAMPLE: Forum Thread (Dynamic)
// ============================================================================

/*
interface ThreadPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const thread = await getThread(params.id);
  
  if (!thread) {
    return {
      title: 'Thread Not Found - AlbionKit',
      description: 'This thread does not exist or has been removed.'
    };
  }
  
  return {
    title: `${thread.title} - AlbionKit Forum`,
    description: thread.content.substring(0, 160),
    
    openGraph: {
      title: thread.title,
      description: thread.content.substring(0, 200),
      type: 'article',
      publishedTime: thread.createdAt,
      authors: [thread.authorName],
      images: [
        {
          url: getFullScreenshotUrl('thread-detail'),
          width: 1920,
          height: 1080,
          alt: `Forum discussion: ${thread.title}`
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: thread.title,
      description: thread.content.substring(0, 200),
      images: [getScreenshotUrl('thread-detail')]
    }
  };
}
*/

// ============================================================================
// QUICK REFERENCE: Screenshot Keys
// ============================================================================

/*
Tools:
- 'market-flipper'
- 'kill-feed'
- 'gold-price'
- 'crafting-calc'
- 'pvp-intel'
- 'zvz-tracker'

Profits:
- 'farming-calc'
- 'cooking-calc'
- 'alchemy-calc'
- 'animal-calc'
- 'chopped-fish-calc'
- 'enchanting-calc'
- 'labour-calc'

Builds:
- 'builds-list'
- 'build-detail'

Forum:
- 'forum-list'
- 'thread-detail'

User:
- 'user-profile'
- 'settings'

Misc:
- 'homepage'
- 'login'
- 'about'
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Issue: Screenshot not showing in social shares

Solutions:
1. Make sure the image is in the correct location: public/screenshots/...
2. Check that the file exists and is accessible
3. Use absolute URLs (getFullScreenshotUrl) for Open Graph
4. Test with Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
5. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator

Issue: Wrong image dimensions

Solutions:
1. Ensure screenshots are 1920x1080 or 1280x720
2. Specify width and height in Open Graph config
3. Use PNG format for best quality

Issue: Images not loading on production

Solutions:
1. Verify images are in the build output
2. Check that public/ folder is being copied correctly
3. Use getFullScreenshotUrl with correct base URL
4. Clear CDN cache if using one
*/

// ============================================================================
// TESTING
// ============================================================================

/*
Test your Open Graph tags:
1. Facebook: https://developers.facebook.com/tools/debug/
2. Twitter: https://cards-dev.twitter.com/validator
3. LinkedIn: https://www.linkedin.com/post-inspector/
4. Slack: Paste URL in Slack to see preview

Test locally:
1. Run: npm run build
2. Run: npm run start
3. Share local tunnel URL (ngrok) to test social shares
*/
