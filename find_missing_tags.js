const fs = require('fs');
const path = require('path');

// Get all tags from build files
const buildFiles = [
    'builds-import-2026.json',
    'builds-import-albionfree-2026.json',
    'builds-import-albiongrind-meta.json',
    'builds-import-2026-mixed-tiers.json'
];

const allTags = new Set();

buildFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const builds = data.builds || [];
            builds.forEach(b => {
                if (b.tags) b.tags.forEach(t => allTags.add(t));
            });
            console.log(`✓ Read ${builds.length} builds from ${file}`);
        } catch (e) {
            console.log(`✗ Error reading ${file}: ${e.message}`);
        }
    }
});

console.log('\n📋 All tags found in build files:');
const sortedTags = Array.from(allTags).sort();
console.log(sortedTags);

// Get current tagOptions from English translation
const enPath = path.join(__dirname, 'messages', 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const currentTagOptions = Object.keys(enContent.BuildView.tagOptions);

console.log('\n📋 Current tagOptions in en.json:');
console.log(currentTagOptions);

// Find missing tags
const missingTags = sortedTags.filter(tag => !currentTagOptions.includes(tag));

console.log('\n❓ Missing tags that need translations:');
console.log(missingTags);

// Show tags that exist in translations but not in builds (for reference)
const extraTags = currentTagOptions.filter(tag => !allTags.has(tag) && !['other_activity', 'other_location'].includes(tag));
console.log('\nℹ️ Tags in translations but not in builds (keeping these):');
console.log(extraTags);
