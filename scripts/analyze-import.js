const data = require('../builds-import-albionfree-2026.json');

const cats = {};
data.forEach(b => {
  cats[b.category] = (cats[b.category] || 0) + 1;
});

console.log('📊 Build Import Analysis\n');
console.log('Category Distribution:');
Object.entries(cats).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});

console.log(`\n✅ Total: ${data.length} builds imported\n`);

// Check data quality
let withYoutube = 0;
let withInventory = 0;
let withAlternatives = 0;

data.forEach(b => {
  if (b.youtubeLink) withYoutube++;
  if (b.items.Inventory) withInventory++;
  if (Object.values(b.items).some(slot => slot?.Alternatives)) withAlternatives++;
});

console.log('📈 Data Quality:');
console.log(`  - Builds with YouTube links: ${withYoutube} (${((withYoutube/data.length)*100).toFixed(1)}%)`);
console.log(`  - Builds with inventory items: ${withInventory} (${((withInventory/data.length)*100).toFixed(1)}%)`);
console.log(`  - Builds with alternative items: ${withAlternatives} (${((withAlternatives/data.length)*100).toFixed(1)}%)`);

// Top tags
const tagCount = {};
data.forEach(b => {
  b.tags.forEach(t => {
    tagCount[t] = (tagCount[t] || 0) + 1;
  });
});

const topTags = Object.entries(tagCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log('\n🏷️  Top 15 Tags:');
topTags.forEach(([tag, count]) => {
  console.log(`  ${tag}: ${count}`);
});
