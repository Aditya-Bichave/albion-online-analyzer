/**
 * Debug script to inspect API response structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function inspectAPI() {
  console.log('🔍 Inspecting API response structure...\n');
  
  const response = await fetch('https://api.albionfreemarket.com/be/builds?limit=5');
  const data = await response.json();
  
  const builds = Array.isArray(data) ? data : data.builds || data.data || [];
  
  console.log(`📦 Total builds in response: ${builds.length}\n`);
  
  builds.forEach((build: any, index: number) => {
    console.log(`\n=== Build ${index + 1}: ${build.name} ===`);
    console.log(`Author: ${build.authorName}`);
    console.log(`Net Votes: ${build.netVotes}`);
    console.log(`\n📋 Slots structure:`);
    
    if (build.slots && build.slots.length > 0) {
      console.log(`   Total slots: ${build.slots.length}`);
      console.log(`   First slot example:`, JSON.stringify(build.slots[0], null, 2));
    } else {
      console.log('   No slots found!');
    }
    
    console.log(`\n🏷️ Tags:`);
    console.log(`   locationTags:`, build.locationTags);
    console.log(`   sizeTags:`, build.sizeTags);
    console.log(`   activityTags:`, build.activityTags);
    console.log(`   roleTags:`, build.roleTags);
    
    console.log(`\n💪 Strengths:`, build.strengths?.slice(0, 3));
    console.log(`😓 Weaknesses:`, build.weaknesses?.slice(0, 3));
    
    console.log(`\n🎥 YouTube URLs:`, build.youtubeUrls);
    console.log(`💰 Budget Tag:`, build.budgetTag);
    
    if (build.skillCombos && build.skillCombos.length > 0) {
      console.log(`\n⚔️ Skill Combos:`, JSON.stringify(build.skillCombos[0], null, 2));
    }
  });
  
  // Save full response for analysis
  fs.writeFileSync(
    path.join(__dirname, '..', 'api-response-debug.json'),
    JSON.stringify(builds, null, 2)
  );
  console.log('\n\n💾 Full response saved to: api-response-debug.json');
}

inspectAPI().catch(console.error);
