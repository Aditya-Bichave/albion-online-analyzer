const path = require('path');
const langs = ['de', 'fr', 'es', 'zh', 'pt', 'pl', 'ko', 'ru', 'tr'];

console.log('=== CHECKING ALL LANGUAGES ===\n');

langs.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const file = require(filePath);
  const tags = file.CreateBuild?.tagOptions || {};
  const hasPvp = !!tags.pvp;
  const hasGanking = !!tags.ganking;
  const total = Object.keys(tags).length;
  console.log(`${lang.toUpperCase()}: ${total} tags, pvp: ${hasPvp ? '✅' : '❌'}, ganking: ${hasGanking ? '✅' : '❌'}`);
  
  if (!hasPvp || !hasGanking) {
    console.log(`  Missing: ${!hasPvp ? 'pvp ' : ''}${!hasGanking ? 'ganking' : ''}`);
  }
});

console.log('\n=== DONE ===');
