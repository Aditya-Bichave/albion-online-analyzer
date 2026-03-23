/**
 * AlbionKit Item ID Validator
 * 
 * Usage: node scripts/validate-items.js
 * 
 * This script validates all item IDs in the builds-import-2026.json file
 * against the official Albion Data API to ensure they exist and won't show broken images.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env.local (if available)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (e) {
  // dotenv not installed, that's ok for validation script
}

const CONFIG = {
  inputFile: path.join(__dirname, '..', 'builds-import-albionfree-2026.json'), // Default file
  itemsApiUrl: 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json',
  cacheFile: path.join(__dirname, '..', '.item-cache.json'),
  cacheExpiryMs: 24 * 60 * 60 * 1000 // 24 hours
};

// Allow custom input file via command line argument
if (process.argv.length > 2) {
  CONFIG.inputFile = path.resolve(process.argv[2]);
  console.log(`📝 Using custom input file: ${CONFIG.inputFile}\n`);
}

// Cache for item data
let itemCache = null;

function loadCache() {
  try {
    if (fs.existsSync(CONFIG.cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf8'));
      const cacheAge = Date.now() - cacheData.timestamp;
      
      if (cacheAge < CONFIG.cacheExpiryMs) {
        console.log('✅ Using cached item data (less than 24h old)');
        itemCache = cacheData.items;
        return true;
      } else {
        console.log('⏳ Cache expired, will fetch fresh data');
      }
    }
  } catch (error) {
    console.log('⚠️  Cache load failed, will fetch fresh data');
  }
  return false;
}

function saveCache(items) {
  try {
    fs.writeFileSync(CONFIG.cacheFile, JSON.stringify({
      timestamp: Date.now(),
      items: items
    }, null, 2));
    console.log('💾 Item cache saved');
  } catch (error) {
    console.log('⚠️  Failed to save cache:', error.message);
  }
}

function fetchItemsFromAPI() {
  return new Promise((resolve, reject) => {
    console.log('📡 Fetching item database from Albion Data Project...');
    console.log('   This may take a minute (file is ~50MB)...');
    
    https.get(CONFIG.itemsApiUrl, { timeout: 120000 }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const items = JSON.parse(data);
          console.log(`✅ Loaded ${items.length} items from API`);
          resolve(items);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch items: ${error.message}`));
    });
  });
}

function getItemData() {
  if (itemCache) {
    return Promise.resolve(itemCache);
  }
  
  return fetchItemsFromAPI().then(items => {
    itemCache = items;
    saveCache(items);
    return items;
  });
}

function validateItemId(itemId, allItems) {
  // Extract base ID (remove @1, @2, @3 enchantment suffixes)
  const baseId = itemId.split('@')[0];
  
  // Search for the item
  const found = allItems.find(item => item.UniqueName === baseId);
  
  if (!found) {
    return {
      valid: false,
      itemId: itemId,
      baseId: baseId,
      reason: 'Item not found in database',
      suggestion: null
    };
  }
  
  // Check if item has localized names (indicates it's a valid, displayable item)
  if (!found.LocalizedNames || Object.keys(found.LocalizedNames).length === 0) {
    return {
      valid: false,
      itemId: itemId,
      baseId: baseId,
      reason: 'Item has no localized names (may be uncraftable/internal)',
      suggestion: null
    };
  }
  
  // Check for English name
  const englishName = found.LocalizedNames['EN-US'];
  if (!englishName) {
    return {
      valid: false,
      itemId: itemId,
      baseId: baseId,
      reason: 'Item has no English name',
      suggestion: null
    };
  }
  
  return {
    valid: true,
    itemId: itemId,
    baseId: baseId,
    name: englishName,
    reason: 'Valid item'
  };
}

function extractItemIdsFromBuild(build) {
  const itemIds = [];
  
  if (!build.items || typeof build.items !== 'object') {
    return itemIds;
  }
  
  // Check each slot
  Object.keys(build.items).forEach(slot => {
    const item = build.items[slot];
    if (item && item.Type) {
      itemIds.push({
        slot: slot,
        itemId: item.Type,
        buildTitle: build.title
      });
    }
    
    // Check alternatives
    if (item && item.Alternatives && Array.isArray(item.Alternatives)) {
      item.Alternatives.forEach(altId => {
        itemIds.push({
          slot: slot,
          itemId: altId,
          buildTitle: build.title,
          isAlternative: true
        });
      });
    }
  });
  
  return itemIds;
}

async function validateAllBuilds() {
  console.log('🔍 AlbionKit Item ID Validator\n');
  console.log('================================\n');
  
  // Load builds
  console.log(`📖 Loading builds from: ${CONFIG.inputFile}`);
  let importData;
  try {
    const fileContent = fs.readFileSync(CONFIG.inputFile, 'utf8');
    importData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to load builds: ${error.message}`);
    process.exit(1);
  }
  
  const builds = importData.builds || (Array.isArray(importData) ? importData : []);
  console.log(`✅ Loaded ${builds.length} builds\n`);
  
  if (builds.length === 0) {
    console.log('⚠️  No builds found in the import file.');
    process.exit(0);
  }
  
  // Load or fetch item database
  let allItems;
  try {
    if (!loadCache()) {
      allItems = await getItemData();
    } else {
      allItems = itemCache;
    }
  } catch (error) {
    console.error(`❌ ${error.message}`);
    console.log('\n💡 Tip: Check your internet connection and try again.');
    process.exit(1);
  }
  
  // Create a Set of all valid item IDs for faster lookup
  const validItemIds = new Set(allItems.map(item => item.UniqueName));
  console.log(`✅ Item database ready (${validItemIds.size} items)\n`);
  
  // Validate all items
  console.log('🔍 Validating item IDs...\n');
  
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: [],
    errors: []
  };
  
  builds.forEach((build, buildIndex) => {
    console.log(`[${buildIndex + 1}/${builds.length}] Checking: ${build.title}`);
    
    const itemIds = extractItemIdsFromBuild(build);
    
    itemIds.forEach(({ slot, itemId, isAlternative }) => {
      results.total++;
      
      const validation = validateItemId(itemId, allItems);
      
      if (validation.valid) {
        results.valid++;
        console.log(`  ✅ ${slot}: ${itemId} → ${validation.name}`);
      } else {
        results.invalid++;
        const errorType = isAlternative ? 'Alternative' : 'Main';
        const errorMsg = `  ❌ ${errorType} - ${slot}: ${itemId}`;
        const reasonMsg = `     Reason: ${validation.reason}`;
        
        console.log(errorMsg);
        console.log(reasonMsg);
        
        results.errors.push({
          buildTitle: build.title,
          slot: slot,
          itemId: itemId,
          reason: validation.reason,
          isAlternative: isAlternative
        });
      }
    });
    
    console.log('');
  });
  
  // Summary
  console.log('================================');
  console.log('📊 Validation Summary');
  console.log('================================');
  console.log(`✅ Valid: ${results.valid}/${results.total}`);
  console.log(`❌ Invalid: ${results.invalid}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.valid / results.total) * 100).toFixed(1)}%\n`);
  
  if (results.errors.length > 0) {
    console.log('❌ Invalid Items Found:\n');
    results.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.buildTitle}`);
      console.log(`   Slot: ${err.slot}`);
      console.log(`   Item ID: ${err.itemId}`);
      console.log(`   Reason: ${err.reason}`);
      console.log('');
    });
    
    console.log('💡 Next Steps:');
    console.log('   1. Check the item IDs above');
    console.log('   2. Use https://wiki.albiononline.com/ to find correct IDs');
    console.log('   3. Update builds-import-2026.json');
    console.log('   4. Run validation again\n');
    
    process.exit(1);
  } else {
    console.log('✨ All item IDs are valid!');
    console.log('💡 You can now safely run: node scripts/import-builds.js\n');
    process.exit(0);
  }
}

// Run validation
validateAllBuilds().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
