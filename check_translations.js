const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, 'messages');

function checkTranslations() {
  console.log('🔍 Starting i18n translation file syntax and key validation...');

  if (!fs.existsSync(MESSAGES_DIR)) {
    console.error(`❌ Messages directory not found at: ${MESSAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('❌ No translation files found in messages directory.');
    process.exit(1);
  }

  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(MESSAGES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      console.log(`✅ [${file}] Valid JSON syntax.`);
    } catch (err) {
      console.error(`❌ [${file}] Invalid JSON syntax:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n❌ i18n Translation Check Failed!');
    process.exit(1);
  } else {
    console.log(`\n✨ All ${files.length} translation files passed JSON syntax validation!`);
    process.exit(0);
  }
}

checkTranslations();
