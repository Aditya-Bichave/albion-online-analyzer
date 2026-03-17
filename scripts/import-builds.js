/**
 * AlbionKit Build Import Script
 * 
 * Usage: node scripts/import-builds.js
 * 
 * This script reads builds from builds-import-2026.json and imports them to Firestore
 * under a specified user account.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ Missing Firebase Admin credentials. Please set:');
  console.error('  - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_CLIENT_EMAIL');
  console.error('  - FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  targetUserId: 'mD2GXXqV1HbGB9KYNKx33Lyes6a2',  // Cosmic O11y's UID
  targetUserName: 'Cosmic O11y',                 // Display name for builds
  dryRun: false,                                 // Set to true to test without saving
  inputFile: path.join(__dirname, '..', 'builds-import-2026.json')
};

// Interactive prompt for configuration
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function getUserProfile(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function createBuild(buildData, userId, userName) {
  try {
    const buildRef = await db.collection('builds').add({
      ...buildData,
      authorId: userId,
      authorName: userName,
      rating: 0,
      ratingCount: 0,
      likes: 0,
      views: 0,
      hidden: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return buildRef.id;
  } catch (error) {
    console.error('Error creating build:', error);
    throw error;
  }
}

async function main() {
  console.log('🎮 AlbionKit Build Import Script\n');
  console.log('================================\n');
  console.log(`📝 Target User ID: ${CONFIG.targetUserId}`);
  console.log(`📝 Display Name: ${CONFIG.targetUserName}`);
  console.log(`🔍 Dry Run: ${CONFIG.dryRun ? '✅ YES (no changes will be made)' : '❌ NO (builds will be saved)'}\n`);
  
  // Ask if user wants to override defaults
  const override = await askQuestion('Use default configuration? (yes/no, default: yes): ');
  if (override.trim().toLowerCase() === 'no') {
    const userId = await askQuestion('Enter your Firebase User ID: ');
    const userName = await askQuestion('Enter display name: ');
    const dryRunInput = await askQuestion('Dry run mode? (yes/no, default: yes): ');
    
    CONFIG.targetUserId = userId.trim() || CONFIG.targetUserId;
    CONFIG.targetUserName = userName.trim() || CONFIG.targetUserName;
    CONFIG.dryRun = dryRunInput.trim().toLowerCase() === 'yes' || dryRunInput.trim() === '';
  }
  
  console.log('');
  
  // Verify user exists
  console.log(`📝 Target User ID: ${CONFIG.targetUserId}`);
  console.log(`📝 Display Name: ${CONFIG.targetUserName}`);
  console.log(`🔍 Dry Run: ${CONFIG.dryRun ? '✅ YES (no changes will be made)' : '❌ NO (builds will be saved)'}\n`);
  
  const userProfile = await getUserProfile(CONFIG.targetUserId);
  if (!userProfile) {
    console.error(`❌ User profile not found for ID: ${CONFIG.targetUserId}`);
    console.error('Please check the User ID and try again.');
    rl.close();
    process.exit(1);
  }
  
  console.log(`✅ Found user: ${userProfile.displayName || userProfile.email}\n`);
  
  // Load builds from JSON
  console.log(`📖 Loading builds from: ${CONFIG.inputFile}`);
  let importData;
  try {
    const fileContent = fs.readFileSync(CONFIG.inputFile, 'utf8');
    importData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to load builds file: ${error.message}`);
    rl.close();
    process.exit(1);
  }
  
  const builds = importData.builds || [];
  console.log(`✅ Loaded ${builds.length} builds\n`);
  
  if (builds.length === 0) {
    console.log('⚠️  No builds found in the import file.');
    rl.close();
    process.exit(0);
  }
  
  // Import builds
  console.log('🚀 Starting import...\n');
  
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  for (let i = 0; i < builds.length; i++) {
    const build = builds[i];
    const buildNumber = i + 1;
    
    console.log(`[${buildNumber}/${builds.length}] Importing: ${build.title}`);
    
    // Validate build
    if (!build.title || !build.category || !build.items) {
      console.log(`  ⚠️  Skipped: Missing required fields`);
      results.skipped++;
      results.errors.push({ title: build.title, reason: 'Missing required fields' });
      continue;
    }
    
    if (CONFIG.dryRun) {
      console.log(`  ✅ [DRY RUN] Would create build`);
      results.success++;
      continue;
    }
    
    try {
      const buildId = await createBuild(build, CONFIG.targetUserId, CONFIG.targetUserName);
      console.log(`  ✅ Success! Build ID: ${buildId}`);
      results.success++;
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      results.failed++;
      results.errors.push({ title: build.title, reason: error.message });
    }
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 Import Summary');
  console.log('================================');
  console.log(`✅ Successful: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.title}: ${err.reason}`);
    });
  }
  
  if (!CONFIG.dryRun && results.success > 0) {
    console.log('\n✨ Builds imported successfully!');
    console.log('💡 Note: Builds may take a few minutes to appear in the app due to caching.');
  } else if (CONFIG.dryRun) {
    console.log('\n💡 This was a dry run. No builds were actually saved.');
    console.log('   Set dryRun: false to import builds.');
  }
  
  rl.close();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
