/**
 * Build Importer from Albion Free Market API
 */

const https = require('https');
const fs = require('fs');

const API_URL = 'https://api.albionfreemarket.com/be/builds?limit=2000';
const OUTPUT_FILE = './builds-import-albionfree-2026.json';
const REPORT_FILE = './ALBIONFREE_IMPORT_REPORT.md';

const SLOT_MAPPING = {
  'mainhand': 'MainHand',
  'offhand': 'OffHand',
  'head': 'Head',
  'armor': 'Armor',
  'shoes': 'Shoes',
  'bag': 'Bag',
  'cape': 'Cape',
  'mount': 'Mount',
  'potion': 'Potion',
  'food': 'Food'
};

function determineCategory(roleTags, sizeTags) {
  if (sizeTags.includes('solo') || roleTags.includes('solo')) return 'solo';
  if (sizeTags.includes('duo')) return 'duo';
  if (sizeTags.includes('small_group')) return 'small_group';
  if (sizeTags.includes('group') || sizeTags.includes('large_group')) return 'group';
  if (sizeTags.includes('zvz') || roleTags.includes('zvz')) return 'zvz';
  return 'solo';
}

function budgetToDifficulty(budget) {
  const mapping = {
    'newbie': 'easy',
    'low_budget': 'easy',
    'medium_budget': 'medium',
    'high_budget': 'hard'
  };
  return mapping[budget] || 'medium';
}

function convertBuild(source) {
  const tags = new Set();
  (source.locationTags || []).forEach(t => tags.add(t));
  (source.activityTags || []).forEach(t => tags.add(t));
  (source.zoneTags || []).forEach(t => tags.add(t));
  
  const items = {};
  (source.slots || []).forEach(slot => {
    const ourSlotName = SLOT_MAPPING[slot.slotType];
    if (!ourSlotName) return;
    
    const mainItem = slot.mainItemSelection;
    if (mainItem?.itemUniqueName) {
      items[ourSlotName] = {
        Type: mainItem.itemUniqueName,
      };
      
      if (slot.alternativeItemSelections?.length > 0) {
        items[ourSlotName].Alternatives = slot.alternativeItemSelections
          .map(alt => alt.itemUniqueName)
          .filter(Boolean);
      }
    }
  });
  
  if (source.inventoryItems?.length > 0) {
    items.Inventory = source.inventoryItems.map(inv => ({
      Type: inv.uniqueName,
      Amount: inv.amount
    }));
  }
  
  const description = source.strengths?.length > 0 
    ? `Strong against: ${source.strengths.slice(0, 2).join(', ')}`
    : `A ${source.roleTags?.join('/') || 'versatile'} build for ${source.locationTags?.join('/') || 'various activities'}`;
  
  let longDescription = `# ${source.name}\n\n`;
  longDescription += `## Overview\n${description}\n\n`;
  
  if (source.skillCombos?.length > 0) {
    longDescription += '## Skill Combos\n';
    source.skillCombos.forEach((combo, i) => {
      longDescription += `\n### Combo ${i + 1}\n${combo.explanation || 'Execute the combo in sequence'}\n`;
      (combo.craftSpell || []).forEach(spell => {
        longDescription += `- **${spell.uniqueName}**: ${spell.usageExplanation || ''}\n`;
      });
    });
    longDescription += '\n';
  }
  
  if (source.inventoryItemsExplanation) {
    longDescription += `## Inventory\n${source.inventoryItemsExplanation}\n\n`;
  }
  
  longDescription += '## Strengths\n' + source.strengths.map(s => `- ${s}`).join('\n') + '\n\n';
  longDescription += '## Weaknesses\n' + source.weaknesses.map(w => `- ${w}`).join('\n') + '\n';
  
  if (source.youtubeUrls?.length > 0) {
    longDescription += `\n## Video Guide\n${source.youtubeUrls.join('\n')}\n`;
  }
  
  return {
    title: source.name,
    description: description.substring(0, 200),
    category: determineCategory(source.roleTags || [], source.sizeTags || []),
    authorName: source.authorName || 'Anonymous',
    tags: Array.from(tags),
    youtubeLink: source.youtubeUrls?.[0] || source.youtubeVideos?.[0]?.url,
    strengths: source.strengths || [],
    weaknesses: source.weaknesses || [],
    mobility: 'medium',
    difficulty: budgetToDifficulty(source.budgetTag || 'medium_budget'),
    items,
    longDescription
  };
}

function fetchBuilds() {
  return new Promise((resolve, reject) => {
    console.log(`Fetching builds from API...`);
    
    https.get(API_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ Successfully fetched ${parsed.builds?.length || 0} builds`);
          resolve(parsed.builds || []);
        } catch (error) {
          reject(new Error('Failed to parse JSON: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function generateReport(builds, imported, skipped) {
  const categoryCount = {};
  imported.forEach(b => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
  });
  
  const topBuilds = [...imported].sort((a, b) => {
    const aVotes = a.title.includes('Ava') ? 100 : 0;
    const bVotes = b.title.includes('Ava') ? 100 : 0;
    return bVotes - aVotes;
  }).slice(0, 10);
  
  let report = `# Albion Free Market Build Import Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `| Metric | Count |\n|--------|-------|\n`;
  report += `| Total Fetched | ${builds.length} |\n`;
  report += `| Imported | ${imported.length} |\n`;
  report += `| Skipped | ${skipped.length} |\n`;
  report += `| Success Rate | ${((imported.length / builds.length) * 100).toFixed(1)}% |\n\n`;
  
  report += `## Builds by Category\n\n`;
  report += `| Category | Count |\n|----------|-------|\n`;
  Object.entries(categoryCount).forEach(([cat, count]) => {
    report += `| ${cat} | ${count} |\n`;
  });
  report += '\n';
  
  report += `## Top Builds Imported\n\n`;
  report += `| Rank | Build Name | Author | Category |\n|------|------------|--------|----------|\n`;
  topBuilds.forEach((build, i) => {
    report += `| ${i + 1} | ${build.title} | ${build.authorName} | ${build.category} |\n`;
  });
  report += '\n';
  
  if (skipped.length > 0) {
    report += `## Skipped Builds\n\n`;
    report += `These builds were skipped (negative votes or conversion errors):\n\n`;
    skipped.slice(0, 20).forEach((build) => {
      report += `- **${build.name}**\n`;
    });
    if (skipped.length > 20) {
      report += `\n... and ${skipped.length - 20} more\n`;
    }
    report += '\n';
  }
  
  report += `## Import Details\n\n`;
  report += `- **Source:** https://albionfreemarket.com\n`;
  report += `- **API Endpoint:** ${API_URL}\n`;
  report += `- **Output File:** ${OUTPUT_FILE}\n`;
  report += `- **Quality Filter:** Only builds with net votes ≥ 0\n`;
  
  return report;
}

async function main() {
  console.log('🚀 Starting build import from Albion Free Market...\n');
  
  const builds = await fetchBuilds();
  
  if (builds.length === 0) {
    console.error('No builds to import');
    return;
  }
  
  console.log('\n📝 Converting builds to our format...');
  const imported = [];
  const skipped = [];
  
  builds.forEach((build) => {
    if (build.netVotes < 0) {
      skipped.push(build);
      return;
    }
    
    try {
      const converted = convertBuild(build);
      imported.push(converted);
    } catch (error) {
      console.error(`Error converting build "${build.name}":`, error.message);
      skipped.push(build);
    }
  });
  
  console.log(`✅ Converted ${imported.length} builds`);
  console.log(`⚠️  Skipped ${skipped.length} builds\n`);
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(imported, null, 2));
  console.log(`💾 Saved ${imported.length} builds to ${OUTPUT_FILE}\n`);
  
  const report = generateReport(builds, imported, skipped);
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`📊 Generated report: ${REPORT_FILE}\n`);
  
  console.log('📈 Import Summary:');
  console.log(`   Total builds fetched: ${builds.length}`);
  console.log(`   Builds imported: ${imported.length}`);
  console.log(`   Builds skipped: ${skipped.length}`);
  console.log(`   Success rate: ${((imported.length / builds.length) * 100).toFixed(1)}%\n`);
}

main().catch(console.error);
