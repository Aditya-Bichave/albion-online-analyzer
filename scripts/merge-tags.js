/**
 * Tag Merger Script
 * Combines old and new tags, updates builds with unified tag system
 */

const fs = require('fs');
const path = require('path');

// Old tags from previous import
const OLD_TAGS = [
  '5v5',
  'Burst',
  'Faction Warfare',
  'Ganking',
  'Gathering',
  'Group',
  'Healer',
  'Hellgate',
  'PvE',
  'PvP',
  'Solo',
  'ZvZ',
  'Tank'
];

// New tags from AlbionFree import
const NEW_TAGS = [
  'arena',
  'ava-dungeon',
  'black_zone',
  'blue_zone',
  'corrupted-dungeon',
  'crafting',
  'crystal_league',
  'depths',
  'exploration',
  'faction_warfare',
  'fame_silver_farm',
  'ganking',
  'gathering',
  'hellgate',
  'knightfall_abbey',
  'mists',
  'open_world',
  'orange_zone',
  'other_activity',
  'other_location',
  'pvp',
  'ratting',
  'red_zone',
  'roads_avalon',
  'solo-dungeon',
  'static-dungeon',
  'territory',
  'tracking',
  'transporting',
  'yellow_zone'
];

// Tag mapping to normalize old tags to new format
const TAG_MAPPING = {
  '5v5': 'arena',
  'Burst': 'pvp',
  'Faction Warfare': 'faction_warfare',
  'Ganking': 'ganking',
  'Gathering': 'gathering',
  'Group': 'open_world',
  'Healer': 'other_activity',
  'Hellgate': 'hellgate',
  'PvE': 'open_world',
  'PvP': 'pvp',
  'Solo': 'solo-dungeon',
  'ZvZ': 'territory',
  'Tank': 'other_activity'
};

// Combined tag list (unified)
const COMBINED_TAGS = [
  // Zone tags
  'black_zone',
  'red_zone',
  'yellow_zone',
  'blue_zone',
  'orange_zone',
  'mists',
  'open_world',
  
  // Activity tags
  'pvp',
  'ganking',
  'fame_silver_farm',
  'gathering',
  'crafting',
  'ratting',
  'tracking',
  'transporting',
  'exploration',
  
  // Dungeon tags
  'solo-dungeon',
  'static-dungeon',
  'ava-dungeon',
  'corrupted-dungeon',
  'knightfall_abbey',
  'hellgate',
  'arena',
  'depths',
  'crystal_league',
  
  // Group content
  'faction_warfare',
  'territory',
  'roads_avalon',
  
  // Other
  'other_activity',
  'other_location'
];

function loadBuilds() {
  const filePath = path.join(__dirname, '..', 'builds-import-albionfree-2026.json');
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function normalizeTags(tags) {
  const normalized = new Set();
  
  tags.forEach(tag => {
    // Convert to lowercase for consistency
    const lowerTag = tag.toLowerCase();
    
    // Map old tags to new tags
    if (TAG_MAPPING[tag] || TAG_MAPPING[lowerTag]) {
      normalized.add(TAG_MAPPING[tag] || TAG_MAPPING[lowerTag]);
    }
    
    // Add the tag as-is if it's already in new format
    if (NEW_TAGS.includes(lowerTag)) {
      normalized.add(lowerTag);
    }
    
    // Add if it's in combined list
    if (COMBINED_TAGS.includes(lowerTag)) {
      normalized.add(lowerTag);
    }
  });
  
  return Array.from(normalized).sort();
}

function addMissingTags(builds) {
  console.log('🏷️  Tag Normalization Script\n');
  console.log('=============================\n');
  
  let buildsUpdated = 0;
  let tagsAdded = 0;
  
  builds.forEach((build, index) => {
    const originalTags = build.tags || [];
    const normalizedTags = normalizeTags(originalTags);
    
    // Check if we added any new tags
    if (normalizedTags.length > originalTags.length) {
      const newTags = normalizedTags.filter(t => !originalTags.map(t => t.toLowerCase()).includes(t.toLowerCase()));
      tagsAdded += newTags.length;
      buildsUpdated++;
      
      build.tags = normalizedTags;
      
      if (index < 10) {
        console.log(`[${index + 1}] ${build.title}`);
        console.log(`    Original: ${originalTags.join(', ')}`);
        console.log(`    Updated:  ${normalizedTags.join(', ')}`);
        console.log(`    Added: ${newTags.length} tags\n`);
      }
    } else {
      build.tags = normalizedTags;
    }
  });
  
  console.log('=============================\n');
  console.log('📊 Summary:\n');
  console.log(`   Builds updated: ${buildsUpdated}/${builds.length}`);
  console.log(`   Tags added: ${tagsAdded}`);
  console.log(`   Average tags per build: ${(builds.reduce((sum, b) => sum + b.tags.length, 0) / builds.length).toFixed(1)}\n`);
  
  return builds;
}

function saveBuilds(builds) {
  const outputPath = path.join(__dirname, '..', 'builds-import-albionfree-2026.json');
  fs.writeFileSync(outputPath, JSON.stringify(builds, null, 2));
  console.log(`💾 Saved updated builds to: ${outputPath}\n`);
}

function generateTagReport(builds) {
  const tagCount = {};
  builds.forEach(b => {
    b.tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  
  const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  
  let report = '# Unified Tag System Report\n\n';
  report += `**Total Tags:** ${sortedTags.length}\n`;
  report += `**Total Builds:** ${builds.length}\n\n`;
  
  report += '## Tag Usage\n\n';
  report += '| Tag | Usage Count | Builds % |\n|-----|-------------|----------|\n';
  
  sortedTags.forEach(([tag, count]) => {
    const percent = ((count / builds.length) * 100).toFixed(1);
    report += `| ${tag} | ${count} | ${percent}% |\n`;
  });
  
  report += '\n## Tag Categories\n\n';
  
  const categories = {
    'Zone': ['black_zone', 'red_zone', 'yellow_zone', 'blue_zone', 'orange_zone', 'mists', 'open_world'],
    'Activity': ['pvp', 'ganking', 'fame_silver_farm', 'gathering', 'crafting', 'ratting', 'tracking', 'transporting', 'exploration'],
    'Dungeon': ['solo-dungeon', 'static-dungeon', 'ava-dungeon', 'corrupted-dungeon', 'knightfall_abbey', 'hellgate', 'arena', 'depths', 'crystal_league'],
    'Group': ['faction_warfare', 'territory', 'roads_avalon'],
    'Other': ['other_activity', 'other_location']
  };
  
  Object.entries(categories).forEach(([category, tags]) => {
    const categoryCount = tags.reduce((sum, tag) => sum + (tagCount[tag] || 0), 0);
    report += `### ${category} (${categoryCount} builds)\n`;
    tags.forEach(tag => {
      if (tagCount[tag]) {
        report += `- ${tag}: ${tagCount[tag]} builds\n`;
      }
    });
    report += '\n';
  });
  
  const reportPath = path.join(__dirname, '..', 'UNIFIED_TAG_SYSTEM.md');
  fs.writeFileSync(reportPath, report);
  console.log(`📊 Generated tag report: ${reportPath}\n`);
}

function main() {
  console.log('🏷️  Starting tag normalization...\n');
  
  const builds = loadBuilds();
  const updatedBuilds = addMissingTags(builds);
  saveBuilds(updatedBuilds);
  generateTagReport(updatedBuilds);
  
  console.log('✅ Tag normalization complete!\n');
}

main();
