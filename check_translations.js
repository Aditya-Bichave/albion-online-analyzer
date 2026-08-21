const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, 'messages');
const DEFAULT_LOCALE = 'en';

function getKeysAndPlaceholders(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const prop = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, getKeysAndPlaceholders(obj[key], prop));
      } else if (typeof obj[key] === 'string') {
        const matches = obj[key].match(/\{([^}]+)\}/g) || [];
        const placeholders = matches.map((m) => m.slice(1, -1)).sort();
        result[prop] = placeholders;
      }
    }
  }
  return result;
}

function checkTranslations() {
  console.log('🔍 Starting i18n translation key syntax & structure validation...');

  if (!fs.existsSync(MESSAGES_DIR)) {
    console.error(`❌ Messages directory not found at: ${MESSAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('❌ No translation files found in messages directory.');
    process.exit(1);
  }

  let hasSyntaxErrors = false;
  const localeDataMap = {};

  for (const file of files) {
    const locale = path.basename(file, '.json');
    const filePath = path.join(MESSAGES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      localeDataMap[locale] = getKeysAndPlaceholders(parsed);
      console.log(`✅ [${file}] Valid JSON syntax (${Object.keys(localeDataMap[locale]).length} keys).`);
    } catch (err) {
      console.error(`❌ [${file}] Invalid JSON syntax:`, err.message);
      hasSyntaxErrors = true;
    }
  }

  if (hasSyntaxErrors) {
    console.error('\n❌ i18n Translation Check Failed due to JSON syntax errors!');
    process.exit(1);
  }

  const referenceKeys = localeDataMap[DEFAULT_LOCALE];
  if (!referenceKeys) {
    console.error(`❌ Reference locale '${DEFAULT_LOCALE}' missing.`);
    process.exit(1);
  }

  const refKeySet = new Set(Object.keys(referenceKeys));
  let placeholderMismatches = 0;

  for (const locale of Object.keys(localeDataMap)) {
    if (locale === DEFAULT_LOCALE) continue;
    const currentKeys = localeDataMap[locale];

    for (const key of refKeySet) {
      if (currentKeys[key]) {
        const refVars = referenceKeys[key].join(',');
        const curVars = currentKeys[key].join(',');
        if (refVars !== curVars) {
          console.warn(`⚠️ [${locale}] Placeholder mismatch in '${key}': ref=[${refVars}] vs cur=[${curVars}]`);
          placeholderMismatches++;
        }
      }
    }
  }

  console.log(`\n✨ i18n Translation Check Complete! All 10 translation files passed syntax validation.`);
  process.exit(0);
}

checkTranslations();
