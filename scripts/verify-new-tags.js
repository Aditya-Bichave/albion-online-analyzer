const path = require('path');
const langs = ['en', 'de', 'fr', 'es', 'zh', 'pt', 'pl', 'ko', 'ru', 'tr'];

console.log('=== TAG TRANSLATION VERIFICATION ===\n');

const newTags = [
  'black_zone', 'red_zone', 'yellow_zone', 'blue_zone', 'orange_zone',
  'mists', 'open_world',
  'pvp', 'ganking', 'fame_silver_farm', 'gathering', 'crafting',
  'ratting', 'tracking', 'transporting', 'exploration',
  'solo-dungeon', 'static-dungeon', 'ava-dungeon', 'corrupted-dungeon',
  'knightfall_abbey', 'hellgate', 'arena', 'depths', 'crystal_league',
  'faction_warfare', 'territory', 'roads_avalon'
];

langs.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const file = require(filePath);
  const tags = file.Builds?.tagOptions || {};
  const hasNew = newTags.filter(t => tags[t]);
  console.log(`${lang.toUpperCase()}: ${Object.keys(tags).length} total tags, ${hasNew.length}/28 new tags`);
  
  if (hasNew.length < 28) {
    const missing = newTags.filter(t => !tags[t]);
    console.log(`  Missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
  }
});

console.log('\n✅ Verification complete!');
