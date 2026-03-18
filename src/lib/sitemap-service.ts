import { adminDb } from './firebase-admin';

/**
 * Get builds for sitemap - only includes builds with proper category
 * to avoid orphaned pages
 */
export async function getAllBuildsForSitemap() {
  try {
    const snapshot = await adminDb.collection('builds')
      .where('category', 'in', ['solo', 'small-scale', 'pvp', 'zvz', 'large-scale', 'group'])
      .select('updatedAt', 'category', 'title', 'likes')
      .orderBy('likes', 'desc')
      .limit(100) // Limit to top 100 builds to avoid too many orphaned pages
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category || 'solo',
        updatedAt: data.updatedAt?.toDate() || new Date(),
        title: data.title,
        likes: data.likes || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching builds for sitemap:', error);
    return [];
  }
}

/**
 * Get threads for sitemap - only includes threads with recent activity
 * to avoid orphaned pages with no content
 */
export async function getAllThreadsForSitemap() {
  try {
    const snapshot = await adminDb.collection('threads')
      .where('lastActivity', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .select('updatedAt', 'title', 'replies', 'views')
      .orderBy('views', 'desc')
      .limit(100) // Limit to top 100 active threads
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        title: data.title,
        replies: data.replies || 0,
        views: data.views || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching threads for sitemap:', error);
    return [];
  }
}

