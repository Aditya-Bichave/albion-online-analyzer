const fs = require('fs');
const path = require('path');

// Get all tags from all build files
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
            const builds = Array.isArray(data) ? data : (data.builds || []);
            builds.forEach(b => {
                if (b.tags) b.tags.forEach(t => allTags.add(t));
            });
        } catch (e) {
            console.log(`✗ Error reading ${file}: ${e.message}`);
        }
    }
});

console.log('📋 All tags from all build files:');
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
console.log(`\nTotal missing: ${missingTags.length}`);
