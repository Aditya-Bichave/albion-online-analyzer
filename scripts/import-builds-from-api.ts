/**
 * Build Importer from Albion Free Market API
 * 
 * Fetches builds from https://api.albionfreemarket.com/be/builds
 * Converts them to our format and saves to JSON
 */

const API_URL = 'https://api.albionfreemarket.com/be/builds';
const OUTPUT_FILE = './builds-import-albionfree-2026.json';
const REPORT_FILE = './ALBIONFREE_IMPORT_REPORT.md';

// Slot mapping from their API to our format
const SLOT_MAPPING: Record<string, string> = {
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

// Category mapping based on role and size tags
function determineCategory(roleTags: string[], sizeTags: string[]): string {
  if (sizeTags.includes('solo') || roleTags.includes('solo')) return 'solo';
  if (sizeTags.includes('duo')) return 'duo';
  if (sizeTags.includes('small_group')) return 'small_group';
  if (sizeTags.includes('group') || sizeTags.includes('large_group')) return 'group';
  if (sizeTags.includes('zvz') || roleTags.includes('zvz')) return 'zvz';
  return 'solo'; // default
}

// Budget to difficulty mapping
function budgetToDifficulty(budget: string): string {
  const mapping: Record<string, string> = {
    'newbie': 'easy',
    'low_budget': 'easy',
    'medium_budget': 'medium',
    'high_budget': 'hard'
  };
  return mapping[budget] || 'medium';
}

// Convert their build format to ours
function convertBuild(source: any): any {
  // Build tags from multiple sources
  const tags = new Set<string>();
  source.locationTags?.forEach((t: string) => tags.add(t));
  source.activityTags?.forEach((t: string) => tags.add(t));
  source.zoneTags?.forEach((t: string) => tags.add(t));
  
  // Convert slots to items
  const items: Record<string, any> = {};
  source.slots?.forEach((slot: any) => {
    const ourSlotName = SLOT_MAPPING[slot.slotType];
    if (!ourSlotName) return;
    
    const mainItem = slot.mainItemSelection;
    if (mainItem?.itemUniqueName) {
      items[ourSlotName] = {
        Type: mainItem.itemUniqueName,
        Quality: mainItem.amount > 1 ? Math.min(3, Math.floor(mainItem.amount / 10)) : undefined,
        Alternatives: slot.alternativeItemSelections?.map((alt: any) => alt.itemUniqueName).filter(Boolean)
      };
      
      // Remove undefined/empty fields
      if (items[ourSlotName].Quality === undefined) delete items[ourSlotName].Quality;
      if (!items[ourSlotName].Alternatives?.length) delete items[ourSlotName].Alternatives;
    }
  });
  
  // Add inventory items if present
  if (source.inventoryItems?.length > 0) {
    items.Inventory = source.inventoryItems.map((inv: any) => ({
      Type: inv.uniqueName,
      Amount: inv.amount
    }));
  }
  
  // Generate description from strengths/weaknesses
  const description = source.strengths?.length > 0 
    ? `Strong against: ${source.strengths.slice(0, 2).join(', ')}`
    : `A ${source.roleTags?.join('/') || 'versatile'} build for ${source.locationTags?.join('/') || 'various activities'}`;
  
  // Build long description
  let longDescription = `# ${source.name}\n\n`;
  longDescription += `## Overview\n${description}\n\n`;
  
  if (source.skillCombos?.length > 0) {
    longDescription += '## Skill Combos\n';
    source.skillCombos.forEach((combo: any, i: number) => {
      longDescription += `\n### Combo ${i + 1}\n${combo.explanation || 'Execute the combo in sequence'}\n`;
      combo.craftSpell?.forEach((spell: any) => {
        longDescription += `- **${spell.uniqueName}**: ${spell.usageExplanation || ''}\n`;
      });
    });
    longDescription += '\n';
  }
  
  if (source.inventoryItemsExplanation) {
    longDescription += `## Inventory\n${source.inventoryItemsExplanation}\n\n`;
  }
  
  longDescription += '## Strengths\n' + source.strengths.map((s: string) => `- ${s}`).join('\n') + '\n\n';
  longDescription += '## Weaknesses\n' + source.weaknesses.map((w: string) => `- ${w}`).join('\n') + '\n';
  
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
    mobility: 'medium', // Would need to analyze items to determine
    difficulty: budgetToDifficulty(source.budgetTag || 'medium_budget'),
    items,
    longDescription,
    // Metadata for sorting/filtering
    _metadata: {
      sourceId: source._id,
      upvotes: source.upvotesCount || 0,
      downvotes: source.downvotesCount || 0,
      netVotes: source.netVotes || 0,
      youtubeViews: source.youtubeViews || 0,
      lastUpdated: source.updatedAt
    }
  };
}

async function fetchBuilds(limit: number = 2000) {
  console.log(`Fetching builds from API (limit: ${limit})...`);
  
  try {
    const response = await fetch(`${API_URL}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.builds?.length || 0} builds`);
    
    return data.builds || [];
  } catch (error) {
    console.error('❌ Failed to fetch builds:', error);
    return [];
  }
}

function generateReport(builds: any[], imported: any[], skipped: any[]) {
  const categoryCount: Record<string, number> = {};
  imported.forEach(b => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
  });
  
  const topBuilds = [...imported].sort((a, b) => b._metadata.netVotes - a._metadata.netVotes).slice(0, 10);
  
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
  
  report += `## Top 10 Builds by Net Votes\n\n`;
  report += `| Rank | Build Name | Author | Net Votes | Category |\n|------|------------|--------|-----------|----------|\n`;
  topBuilds.forEach((build, i) => {
    report += `| ${i + 1} | ${build.title} | ${build.authorName} | ${build._metadata.netVotes} | ${build.category} |\n`;
  });
  report += '\n';
  
  if (skipped.length > 0) {
    report += `## Skipped Builds\n\n`;
    report += `These builds were skipped due to low quality (negative net votes):\n\n`;
    skipped.slice(0, 20).forEach((build: any) => {
      report += `- **${build.name}** (Net Votes: ${build.netVotes})\n`;
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
  
  // Fetch builds
  const builds = await fetchBuilds(2000);
  
  if (builds.length === 0) {
    console.error('No builds to import');
    return;
  }
  
  // Filter and convert
  console.log('\n📝 Converting builds to our format...');
  const imported: any[] = [];
  const skipped: any[] = [];
  
  builds.forEach((build: any) => {
    // Filter: Skip builds with negative net votes
    if (build.netVotes < 0) {
      skipped.push(build);
      return;
    }
    
    try {
      const converted = convertBuild(build);
      imported.push(converted);
    } catch (error) {
      console.error(`Error converting build "${build.name}":`, error);
      skipped.push(build);
    }
  });
  
  console.log(`✅ Converted ${imported.length} builds`);
  console.log(`⚠️  Skipped ${skipped.length} builds\n`);
  
  // Save builds (without _metadata for final output)
  const cleanBuilds = imported.map(({ _metadata, ...build }) => build);
  
  const fs = require('fs');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanBuilds, null, 2));
  console.log(`💾 Saved ${cleanBuilds.length} builds to ${OUTPUT_FILE}\n`);
  
  // Generate report
  const report = generateReport(builds, imported, skipped);
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`📊 Generated report: ${REPORT_FILE}\n`);
  
  // Print summary
  console.log('📈 Import Summary:');
  console.log(`   Total builds fetched: ${builds.length}`);
  console.log(`   Builds imported: ${imported.length}`);
  console.log(`   Builds skipped: ${skipped.length}`);
  console.log(`   Success rate: ${((imported.length / builds.length) * 100).toFixed(1)}%\n`);
}

// Run the importer
main().catch(console.error);
