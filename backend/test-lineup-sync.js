/**
 * Test script to debug lineup synchronization
 * Run with: node test-lineup-sync.js
 */

// Add the backend src directory to the module path
const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'src');
require('module').Module._initPaths();

const mongoose = require('mongoose');
const { debugLineupSync, getRecentMatchIds } = require('./src/cron/lineupCron');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_thesports';

async function testLineupSync() {
  try {
    console.log('🚀 Starting lineup sync test...');
    
    // Connect to MongoDB
    console.log('📱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get recent match IDs
    console.log('🔍 Getting recent match IDs...');
    const matchIds = await getRecentMatchIds();
    
    if (matchIds.length === 0) {
      console.log('❌ No match IDs found. Please check videoStream collection.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${matchIds.length} match IDs to test`);
    
    // Test with the first match ID
    const testMatchId = matchIds[0];
    console.log(`🎯 Testing with match ID: ${testMatchId}`);
    
    await debugLineupSync(testMatchId);
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

// Run the test
testLineupSync();
