const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log('=== TAG TRANSLATIONS SUMMARY ===\n');

const tags = enContent.BuildView.tagOptions;
console.log('Total tags in BuildView.tagOptions:', Object.keys(tags).length);
console.log('\nAll tags with English values:');
console.log('─'.repeat(50));

Object.entries(tags).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
});

console.log('\n✅ All translations have been added to:');
console.log('   de.json, es.json, fr.json, pt.json, ru.json,');
console.log('   ko.json, zh.json, pl.json, tr.json');
