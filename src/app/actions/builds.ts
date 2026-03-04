'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

export async function incrementBuildViewAction(buildId: string) {
  try {
    const buildRef = adminDb.collection('builds').doc(buildId);
    
    // Check if document exists first to avoid errors
    const doc = await buildRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Build not found' };
    }

    await buildRef.update({
      views: FieldValue.increment(1)
    });

    return { success: true };
  } catch (error) {
    console.error('[BuildAction] Error incrementing view:', error);
    return { success: false, error: 'Failed to increment view' };
  }
}
