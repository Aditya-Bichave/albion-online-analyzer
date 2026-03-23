/**
 * Script to import builds from albionfree JSON into Firebase
 * Run with: npx ts-node scripts/import-albionfree-to-firebase.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin SDK initialization
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found. Please add your Firebase Admin SDK service account key.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// Read the albionfree JSON
const jsonPath = path.join(__dirname, '../builds-import-albionfree-2026.json');
const buildsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Found ${buildsData.length} builds in albionfree JSON`);

async function importBuilds() {
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  const BATCH_SIZE = 500; // Firestore limit
  const buildsToImport: any[] = [];
  
  // First pass: collect all builds to import
  console.log('\n🔍 Checking for existing builds...');
  for (const buildData of buildsData) {
    try {
      // Check if build already exists by title + author
      const existingQuery = await db.collection('builds')
        .where('title', '==', buildData.title)
        .where('authorName', '==', buildData.authorName)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        console.log(`⏭️  Skipping: "${buildData.title}" by ${buildData.authorName} (already exists)`);
        skipCount++;
        continue;
      }

      // Transform the build data to match our schema
      const build = {
        title: buildData.title,
        description: buildData.description?.substring(0, 500) || '',
        longDescription: buildData.longDescription || '',
        category: mapCategory(buildData.category),
        items: buildData.items,
        authorId: `albionfree_${buildData.authorName.replace(/\s+/g, '_').toLowerCase()}`,
        authorName: buildData.authorName,
        rating: buildData.rating || 0,
        ratingCount: buildData.ratingCount || 0,
        likes: buildData.likes || 0,
        views: buildData.views || 0,
        tags: buildData.tags || [],
        youtubeLink: buildData.youtubeLink || '',
        strengths: buildData.strengths || [],
        weaknesses: buildData.weaknesses || [],
        mobility: buildData.mobility || 'medium',
        difficulty: buildData.difficulty || 'medium',
        hidden: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      buildsToImport.push(build);
    } catch (error) {
      console.error(`❌ Error preparing "${buildData.title}":`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📝 Ready to import ${buildsToImport.length} builds`);
  
  // Second pass: batch import
  const totalBatches = Math.ceil(buildsToImport.length / BATCH_SIZE);
  console.log(`📦 Will import in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, buildsToImport.length);
    const batch = buildsToImport.slice(start, end);
    
    console.log(`\n⚙️  Processing batch ${i + 1}/${totalBatches} (${batch.length} builds)...`);
    
    const writeBatch: WriteBatch = db.batch();
    
    // Add all builds in this batch
    for (const build of batch) {
      const docRef = db.collection('builds').doc();
      writeBatch.set(docRef, build);
    }
    
    // Commit the batch
    try {
      await writeBatch.commit();
      successCount += batch.length;
      console.log(`✅ Batch ${i + 1} complete: ${batch.length} builds added`);
      console.log(`   Progress: [${successCount}/${buildsToImport.length}]`);
    } catch (error) {
      console.error(`❌ Batch ${i + 1} failed:`, error);
      errorCount += batch.length;
    }
    
    // Add delay between batches to avoid rate limiting
    if (i < totalBatches - 1) {
      console.log('⏳ Waiting 1 second before next batch...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ⏭️  Skipped: ${skipCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total processed: ${buildsData.length}`);
}

function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'solo': 'solo',
    'small_group': 'small-scale',
    'small-scale': 'small-scale',
    'pvp': 'pvp',
    'zvz': 'zvz',
    'large-scale': 'large-scale',
    'group': 'group',
    'large_group': 'large-scale',
  };

  return categoryMap[category] || 'solo';
}

// Run the import
importBuilds()
  .then(() => {
    console.log('\n✨ Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
