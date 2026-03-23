const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// Translations for each language
const translations = {
    'de': { Activity: 'Andere Aktivität', Location: 'Anderer Ort' },
    'es': { Activity: 'Otra Actividad', Location: 'Otra Ubicación' },
    'fr': { Activity: 'Autre Activité', Location: 'Autre Lieu' },
    'pt': { Activity: 'Outra Atividade', Location: 'Outro Local' },
    'ru': { Activity: 'Другое занятие', Location: 'Другое место' },
    'ko': { Activity: '기타 활동', Location: '기타 지역' },
    'zh': { Activity: '其他活动', Location: '其他地点' },
    'pl': { Activity: 'Inna Aktywność', Location: 'Inna Lokalizacja' },
    'tr': { Activity: 'Diğer Aktivite', Location: 'Diğer Konum' }
};

// Read English file to get the base structure
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Find BuildView.tagOptions in English to see what keys exist
console.log('English tagOptions keys:', Object.keys(enContent.BuildView.tagOptions));

// Add new keys to English if they don't exist
if (!enContent.BuildView.tagOptions.other_activity) {
    enContent.BuildView.tagOptions.other_activity = 'Other Activity';
    enContent.BuildView.tagOptions.other_location = 'Other Location';
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf8');
    console.log('✓ Updated en.json with new keys');
}

// Update other languages
const languages = ['de', 'es', 'fr', 'pt', 'ru', 'ko', 'zh', 'pl', 'tr'];

for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠ Skipping ${lang}.json - file not found`);
        continue;
    }

    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add the new translations if they don't exist
        if (!content.BuildView?.tagOptions?.other_activity) {
            if (!content.BuildView) content.BuildView = {};
            if (!content.BuildView.tagOptions) content.BuildView.tagOptions = {};
            
            content.BuildView.tagOptions.other_activity = translations[lang].Activity;
            content.BuildView.tagOptions.other_location = translations[lang].Location;
            
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
            console.log(`✓ Updated ${lang}.json`);
        } else {
            console.log(`- ${lang}.json already has the keys`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${lang}.json:`, error.message);
    }
}

console.log('\nDone! All translation files updated.');
