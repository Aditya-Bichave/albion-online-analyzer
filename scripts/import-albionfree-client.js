/**
 * Client-side script to import builds from albionfree JSON into Firebase
 * Run this in your browser console on the builds page
 */

// Paste your builds-import-albionfree-2026.json content here or fetch it
const BUILDS_JSON_URL = '/builds-import-albionfree-2026.json';

async function importBuilds() {
  console.log('🚀 Starting albionfree build import...');
  
  // Fetch the JSON
  const response = await fetch(BUILDS_JSON_URL);
  const buildsData = await response.json();
  
  console.log(`📦 Found ${buildsData.length} builds in albionfree JSON`);
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  // Import in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < buildsData.length; i += batchSize) {
    const batch = buildsData.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (buildData) => {
      try {
        // Transform the build data
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
        };
        
        // TODO: Add your Firebase import logic here
        // You'll need to use your Firebase web SDK
        console.log(`✅ Would import: "${build.title}" by ${build.authorName}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error with "${buildData.title}":`, error);
        errorCount++;
      }
    }));
    
    console.log(`📊 Progress: ${Math.min(i + batchSize, buildsData.length)}/${buildsData.length}`);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ⏭️  Skipped: ${skipCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total: ${buildsData.length}`);
}

function mapCategory(category) {
  const categoryMap = {
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
importBuilds().catch(console.error);
