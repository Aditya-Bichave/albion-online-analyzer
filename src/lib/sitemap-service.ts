import { adminDb } from './firebase-admin';

/**
 * Get builds for sitemap - returns all builds regardless of category
 */
export async function getAllBuildsForSitemap() {
  try {
    if (!adminDb) {
      return [];
    }

    const snapshot = await adminDb.collection('builds')
      .select('updatedAt', 'title', 'likes')
      .orderBy('likes', 'desc')
      .limit(100) // Limit to top 100 builds
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
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
