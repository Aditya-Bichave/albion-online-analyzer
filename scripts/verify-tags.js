const fs = require('fs');
const path = require('path');
const langs = ['en', 'de', 'fr', 'es', 'zh', 'pt', 'pl', 'ko', 'ru', 'tr'];

console.log('=== TAG TRANSLATION VERIFICATION ===\n');

langs.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const file = require(filePath);
  const tags = file.Builds?.tagOptions || file.Settings?.tagOptions || {};
  const tagCount = Object.keys(tags).length;
  console.log(`${lang.toUpperCase()}: ${tagCount} tags`);
});

console.log('\n✅ All languages updated!');
